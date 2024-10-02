export declare class WorldInitializeEvent {
    protected currentSubscribeId: number;
    protected subscriptions: Record<number, (() => void)>;
    protected currentSubscribes: number;
    protected runId: number | undefined;
    subscribe(callback: () => void): number;
    subscribeSystem(): void;
    unsubscribeSystem(): void;
    unsubscribe(id: number): void;
}
export declare const worldInitialize: WorldInitializeEvent;
