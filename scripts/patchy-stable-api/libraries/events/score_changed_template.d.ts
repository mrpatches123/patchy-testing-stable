import { Entity, Player, Vector3 } from "@minecraft/server";
export declare class ScoreChangedEventTemplate {
    protected currentSubscribeId: number;
    protected subscriptions: Record<number, ((data: {
        target: Player | Entity | string;
        key: string;
        previousValue: any;
        currentValue: any;
        cancel: boolean;
    }) => void)>;
    protected currentSubscribes: number;
    protected runId: number | undefined;
    subscribe(callback: (data: {
        target: Player | Entity | string;
        key: string;
        previousValue: number | boolean | string | Vector3 | undefined;
        currentValue: number | boolean | string | Vector3 | undefined;
        cancel: boolean;
    }) => void): number;
    runEvent(target: Player | Entity | string, key: string, previousValue: number | boolean | string | Vector3 | undefined, currentValue: number | boolean | string | Vector3 | undefined): {
        target: Player | Entity | string;
        key: string;
        previousValue: number | boolean | string | Vector3 | undefined;
        currentValue: number | boolean | string | Vector3 | undefined;
        cancel: boolean;
    };
    unsubscribe(id: number): void;
}
