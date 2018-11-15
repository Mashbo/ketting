"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * HttpError extends the Error object, and is thrown wheenever servers emit
 * HTTP errors.
 *
 * It has a response property, allowing users to find out more about the
 * nature of the error.
 *
 * @constructor
 * @param {Response} response
 */
class HttpError extends Error {
    constructor(response) {
        super('HTTP error ' + response.status);
        this.response = response;
        this.status = response.status;
    }
}
exports.HttpError = HttpError;
/**
 * Problem extends the HttpError object. If a server emits a HTTP error, and
 * the response body's content-type is application/problem+json.
 *
 * application/problem+json is defined in RFC7807 and provides a standardized
 * way to describe error conditions by a HTTP server.
 *
 * @constructor
 * @param {Response} response
 * @param {object} problemBody
 */
class Problem extends HttpError {
    constructor(response, problemBody) {
        super(response);
        this.body = problemBody;
        if (this.body.title) {
            this.message = 'HTTP Error ' + this.status + ': ' + this.body.title;
        }
    }
}
exports.Problem = Problem;
/**
 * This function creates problems, not unlike the the author of this file.
 *
 * It takes a Fetch Response object, and returns a HttpError. If the HTTP
 * response has a type of application/problem+json it will return a Problem
 * object.
 *
 * Because parsing the response might be asynchronous, the function returns
 * a Promise resolving in either object.
 */
async function problemFactory(response) {
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.match(/^application\/problem\+json/i)) {
        const problemBody = await response.json();
        return new Problem(response, problemBody);
    }
    else {
        return new HttpError(response);
    }
}
exports.default = problemFactory;
//# sourceMappingURL=http-error.js.map