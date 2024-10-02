import { Entity, Player, Vector3, World } from "@minecraft/server";
export declare enum StorageChangedType {
    Number = "number",
    Boolean = "boolean",
    String = "string",
    Vector3 = "vector3",
    JSON = "JSON",
    Score = "score",
    All = "all"
}
export declare class StorageChangedEvent {
    protected currentSubscribeId: number;
    protected subscriptions: Record<number, ((data: {
        target: Player | Entity | World | string;
        key: string;
        type: StorageChangedType;
        previousValue: any;
        currentValue: any;
        cancel: boolean;
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
    }) => void): number;
    runEvent(target: Player | Entity | World | string, key: string, type: StorageChangedType, previousValue: number | boolean | string | Vector3 | undefined, currentValue: number | boolean | string | Vector3 | undefined): {
        target: Player | Entity | World | string;
        key: string;
        type: StorageChangedType;
        previousValue: number | boolean | string | Vector3 | undefined;
        currentValue: number | boolean | string | Vector3 | undefined;
        cancel: boolean;
    };
    unsubscribe(id: number): void;
}
export declare const storageChanged: StorageChangedEvent;
