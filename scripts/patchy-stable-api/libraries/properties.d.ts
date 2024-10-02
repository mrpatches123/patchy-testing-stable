import { Entity, Player, ScoreboardObjective, Vector3, World } from "@minecraft/server";
export declare class Storage {
    protected managers: Record<string, EntityStorageManager | WorldStorageManager>;
    get(): WorldStorageManager;
    get(target: World): WorldStorageManager;
    get(target: Entity): EntityStorageManager;
    get(target: Player): EntityStorageManager;
    constructor();
}
declare enum DynamicPropertyTypes {
    string = "string",
    number = "number",
    boolean = "boolean",
    vector3 = "vector3",
    json = "json"
}
declare class DynamicPropertyManager {
    dynamicProperties: Record<string, {
        type?: DynamicPropertyTypes;
        value?: number | boolean | Vector3 | string;
        gotten?: boolean;
    }>;
    protected root: Player | Entity | World;
    constructor(root: Player | Entity | World);
    setString(key: string, value?: string): void;
    getString(key: string): string | undefined;
    setJSON(key: string, value?: any): void;
    getJSON(key: string): any | undefined;
    setNumber(key: string, value?: number): void;
    getNumber(key: string): number | undefined;
    setBoolean(key: string, value?: boolean): void;
    getBoolean(key: string): boolean | undefined;
    setVector3(key: string, value?: Vector3): void;
    getVector3(key: string): Vector3 | undefined;
    removeString(key: string): void;
    removeJSON(key: string): void;
    removeNumber(key: string): void;
    removeBoolean(key: string): void;
    removeVector3(key: string): void;
    /**
     * runs storageChanged event for all keys
     */
    clearAllDynamicProperties(): void;
    get strings(): Record<string, string | undefined>;
    get jsons(): Record<string, any | undefined>;
    get numbers(): Record<string, number | undefined>;
    get booleans(): Record<string, boolean | undefined>;
    get vector3s(): Record<string, Vector3 | undefined>;
}
declare class EntityStorageManager extends DynamicPropertyManager {
    setScore(key: string, value?: number): boolean | void;
    getScore(key: string): number | undefined;
    clearAllScores(): void;
    clearAll(): void;
    removeScore(key: string): void;
    protected root: Player | Entity;
    constructor(root: Player | Entity);
    protected scoresStorage: Record<string, {
        objective?: ScoreboardObjective;
        value?: number;
        gotten?: boolean;
    }>;
    get scores(): Record<string, number | undefined>;
}
declare class WorldStorageManager extends DynamicPropertyManager {
    protected root: World;
    protected scoresStorage: Record<string, Record<string, {
        objective?: ScoreboardObjective;
        value?: number;
        gotten?: boolean;
    }>>;
    constructor(root: World);
    setScore(key: string, dummyName: string, value?: number): boolean | undefined;
    getScore(key: string, dummyName: string): number | undefined;
    removeScore(key: string, dummyName: string): void;
    get scores(): Record<string, Record<string, number | undefined>>;
}
export declare const storage: Storage;
export {};
