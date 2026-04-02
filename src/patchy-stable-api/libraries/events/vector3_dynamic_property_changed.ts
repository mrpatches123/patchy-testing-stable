import { Entity, Player, Vector3, World } from "@minecraft/server";
import { StorageChangedEventTemplate } from "./storage_changed_template";
import { iterateObject } from "../utilities";

export class Vector3DynamicPropertyChangedEvent extends StorageChangedEventTemplate {
	constructor() {
		super();
	}
	subscribe(callback: (data: { target: Player | Entity | World, key: string, previousValue: Vector3 | undefined; currentValue: Vector3 | undefined, cancel: boolean, cancelCache: Boolean, cancelSet: Boolean; }) => void) {
		const subscribeId = this.currentSubscribeId++;
		this.subscriptions[subscribeId] = callback;
		this.currentSubscribes++;
		return subscribeId;
	}
	runEvent(target: Player | Entity | World, key: string, previousValue: Vector3 | undefined, currentValue: Vector3 | undefined)
		: { target: Player | Entity | World, key: string, previousValue: Vector3 | undefined, currentValue: Vector3 | undefined, cancel: boolean, cancelCache: Boolean, cancelSet: Boolean; } {
		const data = { target, previousValue, key, currentValue, cancel: false, cancelCache: false, cancelSet: false };
		iterateObject(this.subscriptions, (id, callback) => callback(data));
		return data;
	}
}
export const vector3DynamicPropertyChanged = new Vector3DynamicPropertyChangedEvent();