/**
 * @description perpetually iterates through an array one function call at a time
 */
export class Iterate<T> {
	private entities: T[] = [];

	private entitiesRefresh: () => T[];
	private iterator = this.getIterator();

	private getIterator() {
		const thisIterate = this;
		return (function* () {
			thisIterate.entities = thisIterate.entitiesRefresh();
			for (let i = 0; ; i++) {
				const mod = i % thisIterate.entities.length;
				if (mod) thisIterate.entities = thisIterate.entitiesRefresh();
				yield thisIterate.entities[mod];
			}

		})();
	}
	public next() {
		return this.iterator.next().value;
	}
	constructor(entitiesRefresh: () => T[]) {
		this.entitiesRefresh = entitiesRefresh;
	}
}