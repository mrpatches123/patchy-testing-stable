/**
 * @description perpetually iterates through an array one function call at a time
 */
export declare class Iterate<T> {
    entities: T[];
    private entitiesRefresh;
    private iterator;
    i: number;
    private getIterator;
    next(): T;
    nextWithData(): {
        value: T;
        isLast: boolean;
        index: number;
    };
    constructor(entitiesRefresh: () => T[]);
}
