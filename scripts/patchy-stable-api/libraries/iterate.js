/**
 * @description perpetually iterates through an array one function call at a time
 */
export class Iterate {
    entities = [];
    entitiesRefresh;
    iterator = this.getIterator();
    getIterator() {
        const thisIterate = this;
        return (function* () {
            thisIterate.entities = thisIterate.entitiesRefresh();
            for (let i = 0;; i++) {
                const mod = i % thisIterate.entities.length;
                if (!thisIterate.entities.length || !mod)
                    thisIterate.entities = thisIterate.entitiesRefresh();
                yield thisIterate.entities[mod];
            }
        })();
    }
    next() {
        return this.iterator.next().value;
    }
    constructor(entitiesRefresh) {
        this.entitiesRefresh = entitiesRefresh;
    }
}
