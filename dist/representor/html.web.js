"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const link_1 = __importDefault(require("../link"));
const base_1 = __importDefault(require("./base"));
/**
 * The Representation class is basically a 'body' of a request
 * or response.
 *
 * This class is for HTML responses. The html.web.js version is the version
 * intended for browsers. The regular html.js is intended for node.js.
 */
class Html extends base_1.default {
    constructor(uri, contentType, body) {
        super(uri, contentType, body);
        const parser = new DOMParser();
        const doc = parser.parseFromString(body, 'text/html');
        linkFromTags(this, doc.getElementsByTagName('link'));
        linkFromTags(this, doc.getElementsByTagName('a'));
    }
}
exports.default = Html;
function linkFromTags(htmlDoc, elements) {
    for (const node of elements) {
        const rels = node.getAttribute('rel');
        const href = node.getAttribute('href');
        const type = node.getAttribute('type') || undefined;
        if (!rels || !href) {
            continue;
        }
        for (const rel of rels.split(' ')) {
            const link = new link_1.default({
                rel: rel,
                baseHref: htmlDoc.uri,
                href: href,
                type: type
            });
            htmlDoc.links.push(link);
        }
    }
}
//# sourceMappingURL=html.web.js.map