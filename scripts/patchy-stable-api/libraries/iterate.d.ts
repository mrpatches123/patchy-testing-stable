/**
 * @description perpetually iterates through an array one function call at a time
 */
export declare class Iterate<T> {
    private entities;
    private entitiesRefresh;
    private iterator;
    private getIterator;
    next(): T;
    constructor(entitiesRefresh: () => T[]);
}
