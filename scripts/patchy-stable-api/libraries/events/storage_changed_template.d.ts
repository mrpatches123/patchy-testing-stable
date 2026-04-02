import { Entity, Player, Vector3, World } from "@minecraft/server";
export declare class StorageChangedEventTemplate {
    protected currentSubscribeId: number;
    protected subscriptions: Record<number, ((data: {
        target: Player | Entity | World;
        key: string;
        previousValue: any;
        currentValue: any;
        cancel: boolean;
        cancelCache: Boolean;
        cancelSet: Boolean;
    }) => void)>;
    protected currentSubscribes: number;
    protected runId: number | undefined;
    subscribe(callback: (data: {
        target: Player | Entity | World;
        key: string;
        previousValue: number | boolean | string | Vector3 | undefined;
        currentValue: number | boolean | string | Vector3 | undefined;
        cancel: boolean;
        cancelCache: Boolean;
        cancelSet: Boolean;
    }) => void): number;
    runEvent(target: Player | Entity | World, key: string, previousValue: number | boolean | string | Vector3 | undefined, currentValue: number | boolean | string | Vector3 | undefined): {
        target: Player | Entity | World;
        key: string;
        previousValue: number | boolean | string | Vector3 | undefined;
        currentValue: number | boolean | string | Vector3 | undefined;
        cancel: boolean;
        cancelCache: Boolean;
        cancelSet: Boolean;
    };
    unsubscribe(id: number): void;
}
