"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sax_1 = __importDefault(require("sax"));
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
        const parser = sax_1.default.parser(false, {});
        parser.onopentag = node => {
            if (!node.attributes.REL) {
                return;
            }
            if (!node.attributes.HREF) {
                return;
            }
            const rels = node.attributes.REL;
            for (const rel of rels.split(' ')) {
                const link = new link_1.default({
                    rel: rel,
                    baseHref: this.uri,
                    href: node.attributes.HREF,
                    type: node.attributes.TYPE || undefined
                });
                this.links.push(link);
            }
        };
        parser.write(body).close();
    }
}
exports.default = Html;
//# sourceMappingURL=html.js.map