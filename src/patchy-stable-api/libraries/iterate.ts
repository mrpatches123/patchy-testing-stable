/**
 * @description perpetually iterates through an array one function call at a time
 */
export class Iterate<T> {
	entities: T[] = [];

	private entitiesRefresh: () => T[];
	private iterator = this.getIterator();
	i = 0;
	private getIterator() {
		const thisIterate = this;
		return (function* () {
			thisIterate.entities = thisIterate.entitiesRefresh();
			for (; ; thisIterate.i++) {
				const mod = thisIterate.i % thisIterate.entities.length;
				if (!thisIterate.entities.length || !mod) thisIterate.entities = thisIterate.entitiesRefresh();
				yield thisIterate.entities[mod];
			}

		})();
	}
	public next() {
		return this.iterator.next().value;
	}
	public nextWithData(): { value: T, isLast: boolean, index: number; } {
		return {
			value: this.iterator.next().value, isLast: !this.entities.length ? true : this.i % this.entities.length >= (this.entities.length - 1), index: this.i % this.entities.length
		};
	};
	constructor(entitiesRefresh: () => T[]) {
		this.entitiesRefresh = entitiesRefresh;
	}
}
