"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_oauth2_1 = __importDefault(require("client-oauth2"));
require("./fetch-polyfill");
class OAuth2Helper {
    constructor(options) {
        this.client = new client_oauth2_1.default(options.client);
        this.token = null;
        this.owner = options.owner;
    }
    /**
     * Does a HTTP request with OAuth2 enabled.
     *
     * This function will automatically grab an access token if it didn't have
     * one, and attempt to refresh the token if it was expired.
     */
    async fetch(request) {
        const token = await this.getToken();
        request.headers.set('Authorization', 'Bearer ' + token.accessToken);
        const response = await fetch(request);
        if (response.status !== 401) {
            return response;
        }
        // If we receive 401, refresh token and try again once
        await this.refreshToken();
        request.headers.set('Authorization', 'Bearer ' + this.token.accessToken);
        return fetch(request);
    }
    /**
     * Retrieves an access token and refresh token.
     */
    async getToken() {
        if (!this.token) {
            return this.refreshToken();
        }
        return this.token;
    }
    /**
     * Obtains a new access token
     */
    async refreshToken() {
        if (this.token && this.token.refreshToken) {
            // If we had a refresh token, use that
            this.token = await this.token.refresh();
            return this.token;
        }
        if (this.owner) {
            // If we use the 'password' grant_type, get a token that way.
            this.token = await this.client.owner.getToken(this.owner.userName, this.owner.password);
            return this.token;
        }
        // Use client_credentials
        this.token = await this.client.credentials.getToken();
        return this.token;
    }
}
exports.OAuth2Helper = OAuth2Helper;
//# sourceMappingURL=oauth.js.map