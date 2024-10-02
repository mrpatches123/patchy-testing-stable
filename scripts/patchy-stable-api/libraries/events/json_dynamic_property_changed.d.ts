import { Entity, Player, World } from "@minecraft/server";
import { StorageChangedEventTemplate } from "./storage_changed_template";
export declare class JSONDynamicPropertyChangedEvent extends StorageChangedEventTemplate {
    constructor();
    subscribe(callback: (data: {
        target: Player | Entity | World;
        key: string;
        previousValue: any | undefined;
        currentValue: any | undefined;
        cancel: boolean;
    }) => void): number;
    runEvent(target: Player | Entity | World, key: string, previousValue: any | undefined, currentValue: any | undefined): {
        target: Player | Entity | World;
        key: string;
        previousValue: any | undefined;
        currentValue: any | undefined;
        cancel: boolean;
    };
}
export declare const jsonDynamicPropertyChanged: JSONDynamicPropertyChangedEvent;
