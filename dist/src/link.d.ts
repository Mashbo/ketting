declare type LinkInit = {
    baseHref: string;
    href: string;
    name?: string;
    rel: string;
    templated?: boolean;
    title?: string;
    type?: string;
};
/**
 * The Link object represents a hyperlink.
 */
export default class Link {
    /**
     * The base href of the parent document. Used for expanding relative links.
     */
    baseHref: string;
    /**
     * The URI of the link. Might be relative
     */
    href: string;
    /**
     * The name for a link. This might be used to disambiguate the link.
     *
     * If you're looking at this, chances are that you might want 'title'
     * instead.
     */
    name?: string;
    /**
     * The relationship type
     */
    rel: string;
    /**
     * Is it a URI template or not?
     */
    templated: boolean;
    /**
     * A human-readable label for the link.
     */
    title: string | null;
    /**
     * A mimetype
     */
    type: string | null;
    constructor(properties: LinkInit);
    /**
     * Returns the absolute link url, based on it's base and relative url.
     */
    resolve(): string;
    /**
     * Expands a link template (RFC6570) and resolves the uri
     *
     * @param {object} variables - A list of variables to expand the link with.
     * @returns {string}
     */
    expand(variables: object): string;
}
export {};
