import Resource from './resource';
declare type Executor = (res: ((value: FollowablePromise) => void), rej: ((reason: any) => any)) => void;
/**
 * The FollowablePromise is a Promise that adds the follow and followAll
 * functions.
 *
 * It's really just a thin wrapper around the promise. Note that we're not
 * extending the built-in Promise object, but proxy it as browsers don't allow
 * extending the Promise object.
 */
export default class FollowablePromise {
    realPromise: Promise<Resource>;
    constructor(executor: Executor);
    /**
     * The then function maps to a standard then function, as it appears on the
     * promise.
     */
    then(onResolve: (result: any) => Resource | Promise<Resource>, onReject?: (reason: any) => never): Promise<Resource>;
    /**
     * The catch function maps to a standard then function, as it appears on the
     * promise.
     */
    catch<T>(onReject: (reason: any) => Promise<T> | T): Promise<Resource | T>;
    /**
     * The follow function will wait for this promise to resolve, assume the
     * resolved value is a Ketting resource and then call 'follow' on it.
     *
     * The function returns a Promise that will resolve into the result of that
     * 'follow' function.
     *
     * In practice this means you can chain multiple 'follow' calls.
     */
    follow(rel: string, variables?: object): FollowablePromise;
    /**
     * The followAll function will wait for this promise to resolve, assume the
     * resolved value is a Ketting resource and then call 'followAll' on it.
     *
     * The function returns a Promise that will resolve into the result of that
     * 'followAll' function.
     *
     * In practice this means you can end a chain of 'follow' calls in the
     * 'followAll' call.
     *
     * It's really the same idea as the follow function, except that you can't
     * keep on chaining after the followAll, because it resolves in an array of
     * resources.
     */
    followAll(rel: string): Promise<Resource[]>;
}
export {};
