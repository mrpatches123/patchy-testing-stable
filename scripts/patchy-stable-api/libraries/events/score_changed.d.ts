import { Entity, Player } from "@minecraft/server";
import { ScoreChangedEventTemplate } from "./score_changed_template";
export declare class BooleanDynamicPropertyChangedEvent extends ScoreChangedEventTemplate {
    constructor();
    subscribe(callback: (data: {
        target: Player | Entity | string;
        key: string;
        previousValue: number | undefined;
        currentValue: number | undefined;
        cancel: boolean;
    }) => void): number;
    runEvent(target: Player | Entity | string, key: string, previousValue: number | undefined, currentValue: number | undefined): {
        target: Player | Entity | string;
        key: string;
        previousValue: number | undefined;
        currentValue: number | undefined;
        cancel: boolean;
    };
}
export declare const scoreChanged: BooleanDynamicPropertyChangedEvent;
