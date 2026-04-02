import { Entity, Player, Vector3, World } from "@minecraft/server";
import { DynamicPropertyTypes } from "../properties";
declare enum StorageChangedTypeNew {
    Score = "score",
    All = "all"
}
export declare const StorageChangedType: {
    readonly String: DynamicPropertyTypes.String;
    readonly Number: DynamicPropertyTypes.Number;
    readonly Boolean: DynamicPropertyTypes.Boolean;
    readonly Vector3: DynamicPropertyTypes.Vector3;
    readonly JSON: DynamicPropertyTypes.JSON;
    readonly Score: StorageChangedTypeNew.Score;
    readonly All: StorageChangedTypeNew.All;
};
export type StorageChangedType = typeof StorageChangedType[keyof typeof StorageChangedType];
export declare class StorageChangedEvent {
    protected currentSubscribeId: number;
    protected subscriptions: Record<number, ((data: {
        target: Player | Entity | World | string;
        key: string;
        type: StorageChangedType;
        previousValue: any;
        currentValue: any;
        cancel: boolean;
        cancelCache: Boolean;
        cancelSet: Boolean;
    }) => void)>;
    protected currentSubscribes: number;
    protected runId: number | undefined;
    subscribe(callback: (data: {
        target: Player | Entity | World | string;
        key: string;
        type: StorageChangedType;
        previousValue: number | boolean | string | Vector3 | undefined;
        currentValue: number | boolean | string | Vector3 | undefined;
        cancel: boolean;
        cancelCache: Boolean;
        cancelSet: Boolean;
    }) => void): number;
    runEvent(target: Player | Entity | World | string, key: string, type: StorageChangedType, previousValue: number | boolean | string | Vector3 | undefined, currentValue: number | boolean | string | Vector3 | undefined): {
        target: Player | Entity | World | string;
        key: string;
        type: StorageChangedType;
        previousValue: number | boolean | string | Vector3 | undefined;
        currentValue: number | boolean | string | Vector3 | undefined;
        cancel: boolean;
        cancelCache: Boolean;
        cancelSet: Boolean;
    };
    unsubscribe(id: number): void;
}
export declare const storageChanged: StorageChangedEvent;
export {};
