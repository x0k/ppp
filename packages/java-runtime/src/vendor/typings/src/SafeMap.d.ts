/**
 * A safe to use key value map.
 *
 * JavaScript objects cannot be used as general-purpose key value maps, as they
 * contain a number of default fields. This class avoids those issues.
 */
export default class SafeMap<T> {
    private cache;
    constructor();
    /**
     * Mutates the key so that it cannot possibly conflict with existing object
     * properties.
     */
    private fixKey(key);
    get(key: string): T;
    has(key: string): boolean;
    set(key: string, value: T): void;
}
