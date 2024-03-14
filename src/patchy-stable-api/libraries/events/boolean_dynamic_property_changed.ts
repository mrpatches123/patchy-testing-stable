import { Entity, Player, World } from "@minecraft/server";
import { StorageChangedEventTemplate } from "./storage_changed_template";
import { iterateObject } from "../utilities";

export class BooleanDynamicPropertyChangedEvent extends StorageChangedEventTemplate {
	constructor() {
		super();
	}
	subscribe(callback: (data: { target: Player | Entity | World, key: string, previousValue: boolean | undefined; currentValue: boolean | undefined, cancel: boolean; }) => void) {
		const subscribeId = this.currentSubscribeId++;
		this.subscriptions[subscribeId] = callback;
		this.currentSubscribes++;
		return subscribeId;
	}
	runEvent(target: Player | Entity | World, key: string, previousValue: boolean | undefined, currentValue: boolean | undefined): { target: Player | Entity | World, key: string, previousValue: boolean | undefined, currentValue: boolean | undefined, cancel: boolean; } {
		const data = { target, key, previousValue, currentValue, cancel: false };
		iterateObject(this.subscriptions, (id, callback) => callback(data));
		return data;
	}
}
export const booleanDynamicPropertyChanged = new BooleanDynamicPropertyChangedEvent();