/**
 * @description perpetually iterates through an array one function call at a time
 */
export declare class Iterate<T> {
    private entities;
    private entitiesRefresh;
    private iterator;
    private i;
    private getIterator;
    next(): T;
    nextWithData(): {
        value: T;
        isLast: boolean;
        index: number;
    };
    constructor(entitiesRefresh: () => T[]);
}
