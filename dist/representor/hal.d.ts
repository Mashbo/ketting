import Representation from './base';
/**
 * The Representation class is basically a 'body' of a request
 * or response.
 *
 * This class is for HAL JSON responses.
 */
export default class Hal extends Representation {
    body: {
        [s: string]: any;
    };
    constructor(uri: string, contentType: string, body: any);
}
