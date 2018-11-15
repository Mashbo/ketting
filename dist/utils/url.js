"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
/**
 * Resolves a relative url using another url.
 *
 * This is the node.js version.
 */
function resolve(base, relative) {
    return url_1.default.resolve(base, relative);
}
exports.resolve = resolve;
//# sourceMappingURL=url.js.map