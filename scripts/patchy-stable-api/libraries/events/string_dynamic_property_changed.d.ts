import { Entity, Player, World } from "@minecraft/server";
import { StorageChangedEventTemplate } from "./storage_changed_template";
export declare class StringDynamicPropertyChangedEvent extends StorageChangedEventTemplate {
    constructor();
    subscribe(callback: (data: {
        target: Player | Entity | World;
        key: string;
        previousValue: string | undefined;
        currentValue: string | undefined;
        cancel: boolean;
    }) => void): number;
    runEvent(target: Player | Entity | World, key: string, previousValue: string | undefined, currentValue: string | undefined): {
        target: Player | Entity | World;
        key: string;
        previousValue: string | undefined;
        currentValue: string | undefined;
        cancel: boolean;
    };
}
export declare const stringDynamicPropertyChanged: StringDynamicPropertyChangedEvent;
