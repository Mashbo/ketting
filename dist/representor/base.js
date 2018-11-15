"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The Representation class is basically a 'body' of a request
 * or response.
 *
 * This is base class for a representation.
 */
class Representation {
    constructor(uri, contentType, body) {
        this.uri = uri;
        this.contentType = contentType;
        this.body = body;
        this.links = [];
        this.embedded = {};
    }
}
exports.default = Representation;
//# sourceMappingURL=base.js.map