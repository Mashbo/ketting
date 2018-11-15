import FollowablePromise from './followable-promise';
import Representor from './representor/base';
import Resource from './resource';
import './utils/fetch-polyfill';
import { OAuth2Helper, OAuth2Init } from './utils/oauth';
declare type ContentType = {
    mime: string;
    representor: string;
    q?: string;
};
declare type AuthOptionsBasic = {
    type: 'basic';
    password: string;
    userName: string;
};
declare type AuthOptionsBearer = {
    type: 'bearer';
    token: string;
};
declare type AuthOptionsOAuth2 = {
    type: 'oauth2';
} & OAuth2Init;
declare type AuthOptions = AuthOptionsBasic | AuthOptionsBearer | AuthOptionsOAuth2;
declare type KettingOptions = {
    auth?: AuthOptions;
    fetchInit?: RequestInit;
};
/**
 * The main Ketting client object.
 */
export default class Ketting {
    /**
     * The url from which all discovery starts.
     */
    bookMark: string;
    /**
     * Here we store all the resources that were ever requested. This will
     * ensure that if the same resource is requested twice, the same object is
     * returned.
     */
    resourceCache: {
        [url: string]: Resource;
    };
    /**
     * Autentication settings.
     *
     * If set, must have at least a `type` property.
     * If type=basic, userName and password must be set.
     */
    auth: AuthOptions;
    /**
     * Content-Type settings and mappings.
     *
     * See the constructor for an example of the structure.
     */
    contentTypes: ContentType[];
    /**
     * A list of settings passed to the Fetch API.
     *
     * It's effectively a list of defaults that are passed as the 'init' argument.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
     */
    fetchInit: RequestInit;
    /**
     * If OAuth2 was configured, this property gives access to OAuth2-related
     * operations.
     */
    oauth2Helper: OAuth2Helper;
    constructor(bookMark: string, options?: KettingOptions);
    /**
     * This function is a shortcut for getResource().follow(x);
     */
    follow(rel: string, variables?: object): FollowablePromise;
    /**
     * Returns a resource by its uri.
     *
     * This function doesn't do any HTTP requests. The uri is optional. If it's
     * not specified, it will return the bookmark resource.
     */
    getResource(uri?: string, skipCache?: boolean): Resource;
    /**
     * This function does an arbitrary request using the fetch API.
     *
     * Every request in ketting is routed through here so it can be initialized
     * with some useful defaults.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch}
     */
    fetch(input: string | Request, init?: RequestInit): Promise<Response>;
    /**
     * This function returns a representor constructor for a mime type.
     *
     * For example, given text/html, this function might return the constructor
     * stored in representor/html.
     */
    getRepresentor(contentType: string): typeof Representor;
    /**
     * Generates an accept header string, based on registered Resource Types.
     */
    getAcceptHeader(): string;
}
export {};
