import { Entity, Player, Vector3 } from "@minecraft/server";
import { iterateObject } from "../utilities";
export class ScoreChangedEventTemplate {
	protected currentSubscribeId = 0;
	protected subscriptions: Record<number, ((data: { target: Player | Entity | string, key: string, previousValue: any, currentValue: any, cancel: boolean; }) => void)> = {};
	protected currentSubscribes = 0;
	protected runId: number | undefined;
	subscribe(callback: (data: { target: Player | Entity | string, key: string, previousValue: number | boolean | string | Vector3 | undefined, currentValue: number | boolean | string | Vector3 | undefined, cancel: boolean; }) => void) {
		const subscribeId = this.currentSubscribeId++;
		this.subscriptions[subscribeId] = callback;
		this.currentSubscribes++;
		return subscribeId;
	}
	runEvent(target: Player | Entity | string, key: string, previousValue: number | boolean | string | Vector3 | undefined, currentValue: number | boolean | string | Vector3 | undefined)
		: { target: Player | Entity | string, key: string, previousValue: number | boolean | string | Vector3 | undefined, currentValue: number | boolean | string | Vector3 | undefined, cancel: boolean; } {
		const data = { target, key, previousValue, currentValue, cancel: false };
		iterateObject(this.subscriptions, (id, callback) => callback(data));
		return data;
	}
	unsubscribe(id: number): void {
		delete this.subscriptions[id];
	}
}