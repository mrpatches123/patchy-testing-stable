import { Entity, ItemStack } from "@minecraft/server";
declare enum CountDirection {
    Up = "Up",
    Down = "Down"
}
export declare class TimerDoneEvent {
    Date: Date;
    eventIds: number;
    callbacks: [number, (() => void)][];
    subscribedCheck: boolean;
    endDate: number;
    subscribeCheck(): void;
    subscribe(callback: () => void): number;
    unsubscribe(eventId: number): void;
    run(): void;
}
export declare class Timer {
    startDate: number;
    countDirection: CountDirection;
    startTime: number | undefined;
    onTimerDone: TimerDoneEvent;
    static getLoadId(): number | undefined;
    static removeTimerFromEntity(entity: Entity, key: string): false | undefined;
    static getFromItemStack(itemStack: ItemStack, key: string): false | Timer | undefined;
    static getFromEntity(entity: Entity, key: string): false | Timer | undefined;
    saveToEntity(entity: Entity, key: string, keepTime?: boolean): boolean;
    saveToItemStack(itemStack: ItemStack, key: string, keepTime?: boolean): false | undefined;
    getTime(): number;
    restart(): this;
    setCurrentTime(time: number, ingoreDown?: boolean): this;
    setCountDown(startTime: number): this;
}
export {};
