"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const hal_1 = __importDefault(require("./representor/hal"));
const html_1 = __importDefault(require("./representor/html"));
const resource_1 = __importDefault(require("./resource"));
const base64 = __importStar(require("./utils/base64"));
const fetchHelper = __importStar(require("./utils/fetch-helper"));
require("./utils/fetch-polyfill");
const oauth_1 = require("./utils/oauth");
const url_1 = require("./utils/url");
/**
 * The main Ketting client object.
 */
class Ketting {
    constructor(bookMark, options) {
        if (typeof options === 'undefined') {
            options = {};
        }
        this.resourceCache = {};
        this.contentTypes = [
            {
                mime: 'application/hal+json',
                representor: 'hal',
                q: '1.0',
            },
            {
                mime: 'application/json',
                representor: 'hal',
                q: '0.9',
            },
            {
                mime: 'text/html',
                representor: 'html',
                q: '0.8',
            }
        ];
        if (options.auth) {
            this.auth = options.auth;
            if (options.auth.type === 'oauth2') {
                this.oauth2Helper = new oauth_1.OAuth2Helper(options.auth);
            }
        }
        if (options.fetchInit) {
            this.fetchInit = options.fetchInit;
        }
        this.bookMark = bookMark;
    }
    /**
     * This function is a shortcut for getResource().follow(x);
     */
    follow(rel, variables) {
        return this.getResource().follow(rel, variables);
    }
    /**
     * Returns a resource by its uri.
     *
     * This function doesn't do any HTTP requests. The uri is optional. If it's
     * not specified, it will return the bookmark resource.
     */
    getResource(uri, skipCache) {
        if (typeof uri === 'undefined') {
            uri = '';
        }
        uri = url_1.resolve(this.bookMark, uri);
        if (typeof uri === 'undefined') {
            skipCache = false;
        }
        if (!this.resourceCache[uri] || skipCache) {
            this.resourceCache[uri] = new resource_1.default(this, uri);
        }
        return this.resourceCache[uri];
    }
    /**
     * This function does an arbitrary request using the fetch API.
     *
     * Every request in ketting is routed through here so it can be initialized
     * with some useful defaults.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch}
     */
    fetch(input, init) {
        const request = fetchHelper.createFetchRequest(input, init, this.fetchInit);
        if (!request.headers.has('User-Agent')) {
            request.headers.set('User-Agent', 'Ketting/' + require('../package.json').version);
        }
        if (!request.headers.has('Authorization') && this.auth) {
            switch (this.auth.type) {
                case 'basic':
                    request.headers.set('Authorization', 'Basic ' + base64.encode(this.auth.userName + ':' + this.auth.password));
                    break;
                case 'bearer':
                    request.headers.set('Authorization', 'Bearer ' + this.auth.token);
                    break;
                case 'oauth2':
                    return this.oauth2Helper.fetch(request);
            }
        }
        return fetch(request);
    }
    /**
     * This function returns a representor constructor for a mime type.
     *
     * For example, given text/html, this function might return the constructor
     * stored in representor/html.
     */
    getRepresentor(contentType) {
        if (contentType.indexOf(';') !== -1) {
            contentType = contentType.split(';')[0];
        }
        contentType = contentType.trim();
        const result = this.contentTypes.find(item => {
            return item.mime === contentType;
        });
        if (!result) {
            throw new Error('Could not find a representor for contentType: ' + contentType);
        }
        switch (result.representor) {
            case 'html':
                return html_1.default;
            case 'hal':
                return hal_1.default;
            default:
                throw new Error('Unknown representor: ' + result.representor);
        }
    }
    /**
     * Generates an accept header string, based on registered Resource Types.
     */
    getAcceptHeader() {
        return this.contentTypes
            .map(contentType => {
            let item = contentType.mime;
            if (contentType.q) {
                item += ';q=' + contentType.q;
            }
            return item;
        })
            .join(', ');
    }
}
exports.default = Ketting;
//# sourceMappingURL=ketting.js.map