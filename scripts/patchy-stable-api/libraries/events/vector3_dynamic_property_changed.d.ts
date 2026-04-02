import { Entity, Player, Vector3, World } from "@minecraft/server";
import { StorageChangedEventTemplate } from "./storage_changed_template";
export declare class Vector3DynamicPropertyChangedEvent extends StorageChangedEventTemplate {
    constructor();
    subscribe(callback: (data: {
        target: Player | Entity | World;
        key: string;
        previousValue: Vector3 | undefined;
        currentValue: Vector3 | undefined;
        cancel: boolean;
        cancelCache: Boolean;
        cancelSet: Boolean;
    }) => void): number;
    runEvent(target: Player | Entity | World, key: string, previousValue: Vector3 | undefined, currentValue: Vector3 | undefined): {
        target: Player | Entity | World;
        key: string;
        previousValue: Vector3 | undefined;
        currentValue: Vector3 | undefined;
        cancel: boolean;
        cancelCache: Boolean;
        cancelSet: Boolean;
    };
}
export declare const vector3DynamicPropertyChanged: Vector3DynamicPropertyChangedEvent;
