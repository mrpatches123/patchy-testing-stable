import { world } from "@minecraft/server";
export declare class BeforeItemUseOnFirstEvent {
    protected currentSubscribeId: number;
    protected subscriptions: Record<number, (Parameters<typeof world.beforeEvents.itemUseOn.subscribe>[0])>;
    protected currentSubscribes: number;
    protected runId: number | undefined;
    protected playerData: Record<string, {
        using?: boolean;
        used?: boolean;
    }>;
    protected itemUseOnCallback: Parameters<typeof world.beforeEvents.itemUseOn.subscribe>[0];
    protected playerLeaveCallback: Parameters<typeof world.beforeEvents.playerLeave.subscribe>[0];
    subscribe(callback: Parameters<typeof world.beforeEvents.itemUseOn.subscribe>[0]): number;
    subscribeSystem(): void;
    unsubscribeSystem(): void;
    unsubscribe(id: number): void;
}
export declare const beforeItemUseOnFirst: BeforeItemUseOnFirstEvent;
