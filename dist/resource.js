"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_link_header_1 = __importDefault(require("http-link-header"));
const followable_promise_1 = __importDefault(require("./followable-promise"));
const http_error_1 = __importDefault(require("./http-error"));
const link_1 = __importDefault(require("./link"));
const fetch_helper_1 = require("./utils/fetch-helper");
const url_1 = require("./utils/url");
/**
 * A 'resource' represents an endpoint on the server.
 *
 * The endpoint has a uri, you might for example be able to GET its
 * presentation.
 *
 * A resource may also have a list of links on them, pointing to other
 * resources.
 *
 * @param {Client} client
 * @param {string} uri
 * @constructor
 */
class Resource {
    constructor(client, uri, contentType = null) {
        this.inFlightRefresh = null;
        this.client = client;
        this.uri = uri;
        this.repr = null;
        this.contentType = contentType;
    }
    /**
     * Fetches the resource representation.
     * Returns a promise that resolves to a parsed json object.
     */
    async get() {
        const r = await this.representation();
        return r.body;
    }
    /**
     * Updates the resource representation with a new JSON object.
     */
    async put(body) {
        const contentType = this.contentType || this.client.contentTypes[0].mime;
        const params = {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': contentType,
                'Accept': this.contentType ? this.contentType : this.client.getAcceptHeader()
            }
        };
        await this.fetchAndThrow(params);
        // Wipe out the local cache
        this.repr = null;
    }
    /**
     * Updates the resource representation with a new JSON object.
     */
    async delete() {
        await this.fetchAndThrow({ method: 'DELETE' });
        // Wipe out the local cache
        this.repr = null;
    }
    /**
     * Sends a POST request to the resource.
     *
     * This function assumes that POST is used to create new resources, and
     * that the response will be a 201 Created along with a Location header that
     * identifies the new resource location.
     *
     * This function returns a Promise that resolves into the newly created
     * Resource.
     *
     * If no Location header was given, it will resolve still, but with an empty
     * value.
     */
    async post(body) {
        const contentType = this.contentType || this.client.contentTypes[0].mime;
        const response = await this.fetchAndThrow({
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': contentType,
            }
        });
        if (response.headers.has('location')) {
            return this.client.getResource(url_1.resolve(this.uri, response.headers.get('location')));
        }
        return null;
    }
    /**
     * Sends a PATCH request to the resource.
     *
     * This function defaults to a application/json content-type header.
     */
    async patch(body) {
        await this.fetchAndThrow({
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // Wipe out the local cache
        this.repr = null;
    }
    /**
     * Refreshes the representation for this resource.
     *
     * This function will return the a parsed JSON object, like the get
     * function does.
     *
     * @return {object}
     */
    async refresh() {
        let response;
        let body;
        // If 2 systems request a 'refresh' at the exact same time, this mechanism
        // will coalesc them into one.
        if (!this.inFlightRefresh) {
            this.inFlightRefresh = this.fetchAndThrow({
                method: 'GET',
                headers: {
                    Accept: this.contentType ? this.contentType : this.client.getAcceptHeader()
                }
            }).then(result1 => {
                response = result1;
                return response.text();
            })
                .then(result2 => {
                body = result2;
                return [response, body];
            });
            await this.inFlightRefresh;
            this.inFlightRefresh = null;
        }
        else {
            // Something else asked for refresh, so we piggypack on it.
            [response, body] = await this.inFlightRefresh;
        }
        const contentType = response.headers.get('Content-Type');
        if (!contentType) {
            throw new Error('Server did not respond with a Content-Type header');
        }
        this.repr = new (this.client.getRepresentor(contentType))(this.uri, contentType, body);
        if (!this.contentType) {
            this.contentType = contentType;
        }
        // Extracting HTTP Link header.
        const httpLinkHeader = response.headers.get('Link');
        if (httpLinkHeader) {
            for (const httpLink of http_link_header_1.default.parse(httpLinkHeader).refs) {
                // Looping through individual links
                for (const rel of httpLink.rel.split(' ')) {
                    // Looping through space separated rel values.
                    this.repr.links.push(new link_1.default({
                        rel: rel,
                        baseHref: this.uri,
                        href: httpLink.uri
                    }));
                }
            }
        }
        // Parsing and storing embedded uris
        for (const uri of Object.keys(this.repr.embedded)) {
            const subResource = this.client.getResource(uri);
            subResource.repr = new (this.client.getRepresentor(contentType))(uri, contentType, this.repr.embedded[uri]);
        }
        return this.repr.body;
    }
    /**
     * Returns the links for this resource, as a promise.
     *
     * The rel argument is optional. If it's given, we will only return links
     * from that relationship type.
     */
    async links(rel) {
        const r = await this.representation();
        if (!rel) {
            return r.links;
        }
        return r.links.filter(item => item.rel === rel);
    }
    /**
     * Follows a relationship, based on its reltype. For example, this might be
     * 'alternate', 'item', 'edit' or a custom url-based one.
     *
     * This function can also follow templated uris. You can specify uri
     * variables in the optional variables argument.
     */
    follow(rel, variables) {
        return new followable_promise_1.default(async (res, rej) => {
            try {
                const links = await this.links(rel);
                let href;
                if (links.length === 0) {
                    throw new Error('Relation with type ' + rel + ' not found on resource ' + this.uri);
                }
                if (links[0].templated && variables) {
                    href = links[0].expand(variables);
                }
                else {
                    href = links[0].resolve();
                }
                const resource = this.client.getResource(href);
                if (links[0].type) {
                    resource.contentType = links[0].type;
                }
                res(resource);
            }
            catch (reason) {
                rej(reason);
            }
        });
    }
    /**
     * Follows a relationship based on its reltype. This function returns a
     * Promise that resolves to an array of Resource objects.
     *
     * If no resources were found, the array will be empty.
     */
    async followAll(rel) {
        const links = await this.links(rel);
        return links.map((link) => {
            const resource = this.client.getResource(link.resolve());
            if (link.type) {
                resource.contentType = link.type;
            }
            return resource;
        });
    }
    /**
     * Returns the representation for the object.
     * If it wasn't fetched yet, this function does the fetch as well.
     *
     * Usually you will want to use the `get()` method instead, unless you need
     * the full object.
     */
    async representation() {
        if (!this.repr) {
            await this.refresh();
        }
        return this.repr;
    }
    /**
     * Does an arbitrary HTTP request on the resource using the Fetch API.
     *
     * The method signature is the same as the MDN fetch object. However, it's
     * possible in this case to not specify a URI or specify a relative URI.
     *
     * When doing the actual request, any relative uri will be resolved to the
     * uri of the current resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
     */
    fetch(input, init) {
        let uri = null;
        let newInit = {};
        if (input === undefined) {
            // Nothing was provided, we're operating on the resource uri.
            uri = this.uri;
        }
        else if (typeof input === 'string') {
            // If it's a string, it might be relative uri so we're resolving it
            // first.
            uri = url_1.resolve(this.uri, input);
        }
        else if (input instanceof Request) {
            // We were passed a request object. We need to extract all its
            // information into the init object.
            uri = url_1.resolve(this.uri, input.url);
            newInit.method = input.method;
            newInit.headers = new Headers(input.headers);
            // @ts-ignore: Possibly an error due to https://github.com/Microsoft/TypeScript/issues/15199
            newInit.body = input.body;
            newInit.mode = input.mode;
            newInit.credentials = input.credentials;
            newInit.cache = input.cache;
            newInit.redirect = input.redirect;
            newInit.referrer = input.referrer;
            newInit.integrity = input.integrity;
        }
        else if (input instanceof Object) {
            // if it was a regular 'object', but not a Request, we're assuming the
            // method was called with the init object as it's first parameter. This
            // is not allowed in the default Fetch API, but we do allow it because
            // in the resource, specifying the uri is optional.
            uri = this.uri;
            newInit = input;
        }
        else {
            throw new TypeError('When specified, input must be a string, Request object or a key-value object');
        }
        // if the 'init' argument is specified, we're using it to override things
        // in newInit.
        if (init) {
            for (const key of Object.keys(init)) {
                if (key === 'headers') {
                    // special case.
                    continue;
                }
                newInit[key] = init[key];
            }
            newInit.headers = fetch_helper_1.mergeHeaders([
                newInit.headers,
                init.headers
            ]);
        }
        // @ts-ignore cross-fetch definitions are broken. See https://github.com/lquixada/cross-fetch/pull/19
        const request = new Request(uri, newInit);
        return this.client.fetch(request);
    }
    /**
     * Does a HTTP request and throws an exception if the server emitted
     * a HTTP error.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
     */
    async fetchAndThrow(input, init) {
        const response = await this.fetch(input, init);
        if (response.ok) {
            return response;
        }
        else {
            throw await http_error_1.default(response);
        }
    }
}
exports.default = Resource;
//# sourceMappingURL=resource.js.map