import { Entity, Player, Vector3, World, system, world } from "@minecraft/server";
import { fixPlayerScore, iterateObject } from "../utilities";
import { worldInitialize } from "./world_initialize";
import { StorageChangedEventTemplate } from "./storage_changed_template";
import { DynamicPropertyTypes } from "../properties";
enum StorageChangedTypeNew {
	Score = "score",
	All = "all",
}
export const StorageChangedType = {
	...StorageChangedTypeNew,
	...DynamicPropertyTypes,
} as const;
export type StorageChangedType = typeof StorageChangedType[keyof typeof StorageChangedType];
export class StorageChangedEvent {
	protected currentSubscribeId = 0;
	protected subscriptions: Record<number, ((data: { target: Player | Entity | World | string, key: string, type: StorageChangedType, previousValue: any, currentValue: any, cancel: boolean, cancelCache: Boolean, cancelSet: Boolean; }) => void)> = {};
	protected currentSubscribes = 0;
	protected runId: number | undefined;
	subscribe(callback: (data: { target: Player | Entity | World | string, key: string, type: StorageChangedType, previousValue: number | boolean | string | Vector3 | undefined, currentValue: number | boolean | string | Vector3 | undefined, cancel: boolean, cancelCache: Boolean, cancelSet: Boolean; }) => void) {
		const subscribeId = this.currentSubscribeId++;
		this.subscriptions[subscribeId] = callback;
		this.currentSubscribes++;
		return subscribeId;
	}
	runEvent(target: Player | Entity | World | string, key: string, type: StorageChangedType, previousValue: number | boolean | string | Vector3 | undefined, currentValue: number | boolean | string | Vector3 | undefined)
		: { target: Player | Entity | World | string, key: string, type: StorageChangedType, previousValue: number | boolean | string | Vector3 | undefined, currentValue: number | boolean | string | Vector3 | undefined, cancel: boolean, cancelCache: Boolean, cancelSet: Boolean; } {
		const data = { target, key, type, previousValue, currentValue, cancel: false, cancelCache: false, cancelSet: false };
		iterateObject(this.subscriptions, (id, callback) => callback(data));
		return data;
	}
	unsubscribe(id: number): void {
		delete this.subscriptions[id];
	}
}
export const storageChanged = new StorageChangedEvent();