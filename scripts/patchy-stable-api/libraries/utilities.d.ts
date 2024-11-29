import { Player, Vector3, ItemStack, Dimension, Entity, EntityQueryOptions, Block } from "@minecraft/server";
import { ActionFormData, ActionFormResponse, MessageFormData, MessageFormResponse, ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
export declare const overworld: Dimension;
export declare const nether: Dimension;
export declare const end: Dimension;
export declare const content: {
    warn(...messages: any[]): void;
    chatFormat(...messages: any[]): void;
};
export declare function toSnakeCase(str: string): string;
export declare function toProperCaseTypeId(typeId: string): string;
export declare function toProperCase(string: string): string;
export declare function toCamelCase(str: string): string;
export declare function fixPlayerScore(player: Player): void;
export declare function iterateObject<T extends Record<string, any>>(obj: T, callback: (key: keyof T, value: T[keyof T], i: number) => void): void;
export declare function isDefined<T>(value: T | undefined | null): value is T;
export declare function isVector3(value: any): value is Vector3;
export declare function chunkString(str: string, length: number): string[];
export declare const facingDirectionToVector3: Record<number, Vector3>;
export declare function parseCommand(message: string, prefix: string): string[];
export declare function cartesianToCircular(vector: Vector3, center?: Vector3): {
    theta: number;
    r: number;
    x: number;
    z: number;
};
export declare function differenceRadians(theta1: number, theta2: number): number;
export declare function shuffle<T>(array: T[]): T[];
export declare function giveItem(player: Player, item: ItemStack): void;
export declare function sendMessageMessageToOtherPlayers(excludePlayers: Player[], message: Parameters<Player['sendMessage']>[0]): void;
/**
 * Entity may not be loaded once
 */
export declare function spawnEntityAsync(dimension: Dimension, typeId: string, location: Vector3, callback?: (entity: Entity) => void | Promise<void>, tickingArea?: boolean): Promise<Entity>;
/**
 * Entity may not be loaded once
 */
export declare function spawnItemAsync(dimension: Dimension, itemStack: ItemStack, location: Vector3, callback?: (entity: Entity) => void | Promise<void>, tickingArea?: boolean): Promise<Entity>;
export declare function getEntityAsync(dimension: Dimension, entityQueryOptions: EntityQueryOptions, callback?: (entity: Entity | undefined) => void | Promise<void>, timeoutTicks?: number, tickingArea?: boolean): Promise<Entity | undefined>;
export declare function getBlockArrayAsync(dimension: Dimension, blockLocations: Vector3[], callback?: (blocks: Block[]) => void | Promise<void>, tickingArea?: boolean): Promise<Block[]>;
export declare function spawnEntityArrayAsync(dimension: Dimension, entitySpawnData: {
    typeId: string;
    location: Vector3;
}[], callback?: (blocks: Entity[]) => void | Promise<void>, tickingArea?: boolean): Promise<Entity[]>;
export declare function getBlocksAsync(dimension: Dimension, blockLocations: Vector3 | [Vector3, Vector3], callback?: (blocks: Block[]) => void | Promise<void>, tickingArea?: boolean): Promise<Block[]>;
/**
 * @param {() => void | Promise<void>} callback
 * @param {number} tickDelay
 * @returns {() => void} cancel() run to cancel
 */
export declare function systemRunIntervalAwaitCallback(callback: () => void | Promise<void>, tickDelay?: number): () => void;
/**
 *
 * @param {number} ticks
 * @returns {Promise<undefined>}
 */
export declare function sleep(ticks?: number): Promise<undefined>;
/**
 * @template {T extends ActionFormData | ModalFormData | MessageFormData} T
 * @param {Player} receiver
 * @param {T} form
 * @returns {T extends ActionFormData ? Promise<ActionFormResponse | undefined> : T extends MessageFormData ? Promise<MessageFormResponse | undefined> : Promise< ModalFormResponse | undefined>}
 */
export declare function showFormAwaitPlayerNotBusy<T extends ActionFormData | ModalFormData | MessageFormData>(receiver: Player, form: T): Promise<(T extends ActionFormData ? ActionFormResponse : T extends MessageFormData ? MessageFormResponse : ModalFormResponse) | undefined>;
