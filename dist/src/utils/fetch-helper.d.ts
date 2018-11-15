import './fetch-polyfill';
/**
 * Creates a Fetch Request object, based on a number of settings.
 *
 * @param {string|Request} input - Url or input request object.
 * @param {object} init - A list of Fetch settings
 * @param {object} defaultInit - A list of default settings to use if they
 *                              weren't overridden by init.
 * @return {Response}
 */
export declare function createFetchRequest(input: any, init: any, defaultInit: any): Request;
declare type HeaderSet = any;
/**
 * Merges sets of HTTP headers.
 *
 * Each item in the array is a key->value object, a Fetch Headers object
 * or falsey.
 *
 * Any headers that appear more than once get replaced. The last occurence
 * wins.
 */
export declare function mergeHeaders(headerSets: HeaderSet[]): Headers;
export {};
