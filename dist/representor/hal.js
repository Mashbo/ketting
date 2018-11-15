"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const link_1 = __importDefault(require("../link"));
const url_1 = require("../utils/url");
const base_1 = __importDefault(require("./base"));
/**
 * The Representation class is basically a 'body' of a request
 * or response.
 *
 * This class is for HAL JSON responses.
 */
class Hal extends base_1.default {
    constructor(uri, contentType, body) {
        super(uri, contentType, body);
        if (typeof body === 'string') {
            this.body = JSON.parse(body);
        }
        else {
            this.body = body;
        }
        if (typeof this.body._links !== 'undefined') {
            parseHalLinks(this);
        }
        if (typeof this.body._embedded !== 'undefined') {
            parseHalEmbedded(this);
        }
        delete this.body._links;
        delete this.body._embedded;
    }
}
exports.default = Hal;
/**
 * Parse the Hal _links object and populate the 'links' property.
 */
const parseHalLinks = (representation) => {
    for (const relType of Object.keys(representation.body._links)) {
        let links = representation.body._links[relType];
        if (!Array.isArray(links)) {
            links = [links];
        }
        parseHalLink(representation, relType, links);
    }
};
/**
 * Parses a single HAL link from a _links object, or a list of links.
 */
const parseHalLink = (representation, rel, links) => {
    for (const link of links) {
        representation.links.push(new link_1.default({
            rel: rel,
            baseHref: representation.uri,
            href: link.href,
            title: link.title,
            type: link.type,
            templated: link.templated,
            name: link.name
        }));
    }
};
/**
 * Parse the HAL _embedded object. Right now we're just grabbing the
 * information from _embedded and turn it into links.
 */
const parseHalEmbedded = (representation) => {
    for (const relType of Object.keys(representation.body._embedded)) {
        let embedded = representation.body._embedded[relType];
        if (!Array.isArray(embedded)) {
            embedded = [embedded];
        }
        for (const embeddedItem of embedded) {
            const uri = url_1.resolve(representation.uri, embeddedItem._links.self.href);
            // Only adding a link to the representation if it didn't already exist.
            if (!representation.links.find(item => {
                return item.rel === relType && embeddedItem._links.self.href === item.href;
            })) {
                representation.links.push(new link_1.default({
                    rel: relType,
                    baseHref: representation.uri,
                    href: embeddedItem._links.self.href
                }));
            }
            representation.embedded[uri] = embeddedItem;
        }
    }
};
//# sourceMappingURL=hal.js.map