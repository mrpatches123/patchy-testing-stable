class WorldInitializeEvent {
	currentSubscribeId = 0;
	subscribes: Record<number, (() => void)> = {};
	currentSubscribes = 0;
	subscribe(callback: () => void): number {
		const subscribeId = this.currentSubscribeId++;
		this.subscribes[subscribeId] = callback;
		this.currentSubscribes++;
		return subscribeId;
	}

	unsubscribeSystem() {

	}
	unsubscribe(id: number): void {
		if (--this.currentSubscribes <= 0) {

		}
		delete this.subscribes[id];
	}
}