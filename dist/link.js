"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uri_template_1 = __importDefault(require("uri-template"));
const url_1 = require("./utils/url");
/**
 * The Link object represents a hyperlink.
 */
class Link {
    constructor(properties) {
        this.templated = false;
        this.title = null;
        this.type = null;
        for (const key of ['baseHref', 'href', 'name', 'rel', 'templated', 'title', 'type']) {
            if (properties[key]) {
                this[key] = properties[key];
            }
        }
    }
    /**
     * Returns the absolute link url, based on it's base and relative url.
     */
    resolve() {
        return url_1.resolve(this.baseHref, this.href);
    }
    /**
     * Expands a link template (RFC6570) and resolves the uri
     *
     * @param {object} variables - A list of variables to expand the link with.
     * @returns {string}
     */
    expand(variables) {
        if (!this.templated) {
            return url_1.resolve(this.baseHref, this.href);
        }
        else {
            const templ = uri_template_1.default.parse(this.href);
            const expanded = templ.expand(variables);
            return url_1.resolve(this.baseHref, expanded);
        }
    }
}
exports.default = Link;
//# sourceMappingURL=link.js.map