import { Player } from "@minecraft/server";
export declare class PlayerJoinedEvent {
    protected currentSubscribeId: number;
    protected subscriptions: Record<number, ((data: {
        player: Player;
    }) => void)>;
    protected currentSubscribes: number;
    protected runId: number | undefined;
    protected loads: Record<string, boolean>;
    subscribe(callback: ((data: {
        player: Player;
    }) => void)): number;
    subscribeSystem(): void;
    runEvent(player: Player): void;
    unsubscribeSystem(): void;
    unsubscribe(id: number): void;
}
export declare const playerJoined: PlayerJoinedEvent;
