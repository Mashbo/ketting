import FollowablePromise from './followable-promise';
import Ketting from './ketting';
import Link from './link';
import Representation from './representor/base';
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
export default class Resource<T = any> {
    /**
     * Reference to the main Client
     */
    client: Ketting;
    /**
     * The current representation, or body of the resource.
     */
    repr: Representation | null;
    /**
     * The uri of the resource
     */
    uri: string;
    /**
     * A default mimetype for the resource.
     *
     * This mimetype is used for PUT and POST requests by default.
     * The mimetype is sniffed in a few different ways.
     *
     * If a GET request is done, and the GET request had a mimetype it will
     * be used to set this value.
     *
     * It's also possible for resources to get a mimetype through a link.
     *
     * If the mimetype was "null" when doing the request, the chosen mimetype
     * will come from the first item in Client.resourceTypes
     */
    contentType: string | null;
    private inFlightRefresh;
    constructor(client: Ketting, uri: string, contentType?: string);
    /**
     * Fetches the resource representation.
     * Returns a promise that resolves to a parsed json object.
     */
    get(): Promise<T>;
    /**
     * Updates the resource representation with a new JSON object.
     */
    put(body: T): Promise<void>;
    /**
     * Updates the resource representation with a new JSON object.
     */
    delete(): Promise<void>;
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
    post(body: object): Promise<Resource | null>;
    /**
     * Sends a PATCH request to the resource.
     *
     * This function defaults to a application/json content-type header.
     */
    patch(body: object): Promise<void>;
    /**
     * Refreshes the representation for this resource.
     *
     * This function will return the a parsed JSON object, like the get
     * function does.
     *
     * @return {object}
     */
    refresh(): Promise<T>;
    /**
     * Returns the links for this resource, as a promise.
     *
     * The rel argument is optional. If it's given, we will only return links
     * from that relationship type.
     */
    links(rel?: string): Promise<Link[]>;
    /**
     * Follows a relationship, based on its reltype. For example, this might be
     * 'alternate', 'item', 'edit' or a custom url-based one.
     *
     * This function can also follow templated uris. You can specify uri
     * variables in the optional variables argument.
     */
    follow(rel: string, variables?: object): FollowablePromise;
    /**
     * Follows a relationship based on its reltype. This function returns a
     * Promise that resolves to an array of Resource objects.
     *
     * If no resources were found, the array will be empty.
     */
    followAll(rel: string): Promise<Resource[]>;
    /**
     * Returns the representation for the object.
     * If it wasn't fetched yet, this function does the fetch as well.
     *
     * Usually you will want to use the `get()` method instead, unless you need
     * the full object.
     */
    representation(): Promise<Representation>;
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
    fetch(input: Request | string | RequestInit, init?: RequestInit): Promise<Response>;
    /**
     * Does a HTTP request and throws an exception if the server emitted
     * a HTTP error.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
     */
    fetchAndThrow(input: Request | string | object, init?: object): Promise<Response>;
}
