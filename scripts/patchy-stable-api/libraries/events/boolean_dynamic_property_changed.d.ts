import { Entity, Player, World } from "@minecraft/server";
import { StorageChangedEventTemplate } from "./storage_changed_template";
export declare class BooleanDynamicPropertyChangedEvent extends StorageChangedEventTemplate {
    constructor();
    subscribe(callback: (data: {
        target: Player | Entity | World;
        key: string;
        previousValue: boolean | undefined;
        currentValue: boolean | undefined;
        cancel: boolean;
    }) => void): number;
    runEvent(target: Player | Entity | World, key: string, previousValue: boolean | undefined, currentValue: boolean | undefined): {
        target: Player | Entity | World;
        key: string;
        previousValue: boolean | undefined;
        currentValue: boolean | undefined;
        cancel: boolean;
    };
}
export declare const booleanDynamicPropertyChanged: BooleanDynamicPropertyChangedEvent;
