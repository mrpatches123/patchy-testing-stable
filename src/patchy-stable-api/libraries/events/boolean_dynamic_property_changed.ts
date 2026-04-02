import { Entity, Player, World } from "@minecraft/server";
import { StorageChangedEventTemplate } from "./storage_changed_template";
import { iterateObject } from "../utilities";

export class BooleanDynamicPropertyChangedEvent extends StorageChangedEventTemplate {
	constructor() {
		super();
	}
	subscribe(callback: (data: { target: Player | Entity | World, key: string, previousValue: boolean | undefined; currentValue: boolean | undefined, cancel: boolean, cancelCache: Boolean, cancelSet: Boolean; }) => void) {
		const subscribeId = this.currentSubscribeId++;
		this.subscriptions[subscribeId] = callback;
		this.currentSubscribes++;
		return subscribeId;
	}
	runEvent(target: Player | Entity | World, key: string, previousValue: boolean | undefined, currentValue: boolean | undefined): { target: Player | Entity | World, key: string, previousValue: boolean | undefined, currentValue: boolean | undefined, cancel: boolean, cancelCache: Boolean, cancelSet: Boolean; } {
		const data = { target, key, previousValue, currentValue, cancel: false, cancelCache: false, cancelSet: false };
		iterateObject(this.subscriptions, (id, callback) => callback(data));
		return data;
	}
}
export const booleanDynamicPropertyChanged = new BooleanDynamicPropertyChangedEvent();