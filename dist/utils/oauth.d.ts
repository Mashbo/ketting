import ClientOAuth2 from 'client-oauth2';
import { Token } from 'client-oauth2';
import './fetch-polyfill';
export declare type OAuth2Init = {
    client: {
        clientId: string;
        clientSecret: string;
        accessTokenUri: string;
        scopes: string[];
    };
    owner?: {
        userName: string;
        password: string;
    };
};
export declare class OAuth2Helper {
    client: ClientOAuth2;
    token: null | Token;
    owner: {
        userName: string;
        password: string;
    };
    constructor(options: OAuth2Init);
    /**
     * Does a HTTP request with OAuth2 enabled.
     *
     * This function will automatically grab an access token if it didn't have
     * one, and attempt to refresh the token if it was expired.
     */
    fetch(request: Request): Promise<Response>;
    /**
     * Retrieves an access token and refresh token.
     */
    getToken(): Promise<Token>;
    /**
     * Obtains a new access token
     */
    refreshToken(): Promise<Token>;
}
