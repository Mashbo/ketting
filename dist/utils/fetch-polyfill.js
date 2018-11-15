"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importStar(require("node-fetch"));
// Registering Fetch as a glboal polyfill
global.fetch = node_fetch_1.default;
global.Request = node_fetch_1.Request;
global.Headers = node_fetch_1.Headers;
//# sourceMappingURL=fetch-polyfill.js.map