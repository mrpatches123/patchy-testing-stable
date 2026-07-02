import { world, Player, Vector3, system, ItemStack, EntityInventoryComponent, Dimension, Entity, EntityQueryOptions, Block, PlayerLeaveBeforeEventSignal, DimensionTypes } from "@minecraft/server";
import { Vector } from "./vector";
import { ActionFormData, ActionFormResponse, FormCancelationReason, MessageFormData, MessageFormResponse, ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { StringUtilities } from "./utilities/string";
import { WorldSystemUtilities } from "./utilities/world_system";
import { MiscUtilities } from "./utilities/misc";
import { MathUtilities } from "./utilities/math";

export let overworld: Dimension;
export let nether: Dimension;
export let end: Dimension;
export let dimensions: Dimension[] = [];
world.afterEvents.worldLoad.subscribe(() => {
	overworld = world.getDimension("overworld");
	nether = world.getDimension("nether");
	nether = world.getDimension("the_end");
	dimensions = DimensionTypes.getAll().map(type => world.getDimension(type.typeId));
});


export const content = {
	warn(...messages: any[]) {
		console.warn(messages.map(message => JSON.stringify(message, (key, value) => (value instanceof Function) ? '<f>' : value)).join(' '));
	},
	chatFormat(...messages: any[]) {
		chunkString(messages.map(message => JSON.stringify(message, (key, value) => (value instanceof Function) ? '<f>' : value, 4)).join(' '), 500).forEach(message => world.sendMessage(message));
	}
};
export function toSnakeCase(str: string) {
	return StringUtilities.toSnakeCase(str);
}
export function toProperCaseTypeId(typeId: string) {
	return StringUtilities.toProperCaseTypeId(typeId);
}
export function toProperCase(string: string) {
	return StringUtilities.toProperCase(string);
}
export function toCamelCase(str: string) {
	return StringUtilities.toCamelCase(str);
}
try {
	world.scoreboard.addObjective("test");
} catch (e) { }
export function fixPlayerScore(player: Player) {
	if (!player.scoreboardIdentity)
		player.runCommand('scoreboard players set @s test 0');
}
export function iterateObject<T extends Record<string, any>>(obj: T, callback: (key: keyof T, value: T[keyof T], i: number) => void) {
	return MiscUtilities.iterateObject(obj, callback);
}

export function isDefined<T>(value: T | undefined | null): value is T {
	return MiscUtilities.isDefined(value);
}
export function isVector3(value: any): value is Vector3 {
	return MiscUtilities.isVector3(value);
}
export function chunkString(str: string, length: number) {
	return StringUtilities.chunkString(str, length);
}

export const facingDirectionToVector3: Record<number, Vector3> = {
	0: { x: 0, y: -1, z: 0 },
	1: { x: 0, y: 1, z: 0 },
	2: { x: 0, y: 0, z: 1 },
	3: { x: 0, y: 0, z: -1 },
	4: { x: 1, y: 0, z: 0 },
	5: { x: -1, y: 0, z: 0 },
};
export function parseCommand(message: string, prefix: string) {
	return StringUtilities.parseCommand(message, prefix);
}


export function cartesianToCircular(vector: Vector3, center: Vector3 = { x: 0, y: 0, z: 0 }) {
	return MathUtilities.cartesianToCircular(vector, center);
}
const PI2 = 2 * Math.PI;
export function differenceRadians(theta1: number, theta2: number) {
	return MathUtilities.differenceRadians(theta1, theta2);

}
export function shuffle<T>(array: T[]): T[] {
	let currentIndex = array.length, randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex > 0) {

		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
	}

	return array;
}
export function giveItem(player: Player, item: ItemStack) {
	const container = (player.getComponent("minecraft:inventory") as EntityInventoryComponent).container!;
	const itemRemainder = container.addItem(item);
	if (!itemRemainder) return;
	player.dimension.spawnItem(itemRemainder, player.location);
}
export function sendMessageMessageToOtherPlayers(excludePlayers: Player[], message: Parameters<Player['sendMessage']>[0]) {
	world.getAllPlayers().forEach((player) => {
		if (excludePlayers.some(p => p.id === player.id)) return;
		player.sendMessage(message);
	});
};
/**
 * Entity may not be loaded once 
 */
export async function spawnEntityAsync(dimension: Dimension, typeId: string, location: Vector3, callback?: (entity: Entity) => void | Promise<void>, tickingArea: boolean = true): Promise<Entity> {
	return WorldSystemUtilities.spawnEntityAsync(dimension, typeId, location, callback, tickingArea);

}
/**
 * Entity may not be loaded once 
 */
export async function spawnItemAsync(dimension: Dimension, itemStack: ItemStack, location: Vector3, callback?: (entity: Entity) => void | Promise<void>, tickingArea: boolean = true): Promise<Entity> {
	return WorldSystemUtilities.spawnItemAsync(dimension, itemStack, location, callback, tickingArea);
}
export async function getEntityAsync(dimension: Dimension, entityQueryOptions: EntityQueryOptions, callback?: (entity: Entity | undefined) => void | Promise<void>, timeoutTicks = Infinity, tickingArea: boolean = true): Promise<Entity | undefined> {
	return WorldSystemUtilities.getEntityAsync(dimension, entityQueryOptions, callback, timeoutTicks, tickingArea);
}
export async function getBlockArrayAsync(dimension: Dimension, blockLocations: Vector3[], callback?: (blocks: Block[]) => void | Promise<void>, tickingArea: boolean = true): Promise<Block[]> {
	return WorldSystemUtilities.getBlockArrayAsync(dimension, blockLocations, callback, tickingArea);
}
export async function spawnEntityArrayAsync(dimension: Dimension, entitySpawnData: { typeId: string, location: Vector3; }[], callback?: (blocks: Entity[]) => void | Promise<void>, tickingArea: boolean = true): Promise<Entity[]> {
	return WorldSystemUtilities.spawnEntityArrayAsync(dimension, entitySpawnData, callback, tickingArea);
}
export async function getBlocksAsync(dimension: Dimension, blockLocations: Vector3 | [Vector3, Vector3], callback?: (blocks: Block[]) => void | Promise<void>, tickingArea: boolean = true): Promise<Block[]> {
	return WorldSystemUtilities.getBlocksAsync(dimension, blockLocations, callback, tickingArea);
}

/**
 * @param {() => void | Promise<void>} callback
 * @param {number} tickDelay 
 * @returns {() => void} cancel() run to cancel
 */
export function systemRunIntervalAwaitCallback(callback: () => void | Promise<void>, tickDelay = 0): () => void {
	return WorldSystemUtilities.systemRunIntervalAwaitCallback(callback, tickDelay);

}

/**
 * 
 * @param {number} ticks 
 * @returns {Promise<undefined>}
 */
export async function sleep(ticks: number = 0): Promise<void> {
	return await system.waitTicks(ticks);
}
/**
 * @type {Record<string, boolean>}
 */
const playersAwaitingForm: Record<string, boolean> = {};
/**
 * @type {Parameters<PlayerLeaveBeforeEventSignal['subscribe']>[0]}
 */
const leaveCallback: Parameters<PlayerLeaveBeforeEventSignal['subscribe']>[0] = (event) => {
	delete playersAwaitingForm[event.player.id];
};
/**
 * @type {boolean}
 */
const subscribedLeaveEvent = false;
/**
 * @returns {void}
 */
function subscribeLeaveEvent() {
	if (subscribedLeaveEvent) return;
	world.beforeEvents.playerLeave.subscribe(leaveCallback);
}
/**
 * @template {T extends ActionFormData | ModalFormData | MessageFormData} T
 * @param {Player} receiver 
 * @param {T} form 
 * @returns {T extends ActionFormData ? Promise<ActionFormResponse | undefined> : T extends MessageFormData ? Promise<MessageFormResponse | undefined> : Promise< ModalFormResponse | undefined>}
 */
export async function showFormAwaitPlayerNotBusy<T extends ActionFormData | ModalFormData | MessageFormData>(receiver: Player, form: T): Promise<(T extends ActionFormData ? ActionFormResponse : T extends MessageFormData ? MessageFormResponse : ModalFormResponse) | undefined> {
	let response: (T extends ActionFormData ? ActionFormResponse : T extends MessageFormData ? MessageFormResponse : ModalFormResponse) | undefined;
	subscribeLeaveEvent();
	if (receiver.id in playersAwaitingForm) return;
	try {
		while (true) {
			if (!receiver || !receiver.isValid) break;
			response = await form.show(receiver) as typeof response;
			if (response?.cancelationReason !== FormCancelationReason.UserBusy) {
				break;
			}
			await sleep();
		}
	} catch (error: any) {
		console.warn(error.stack);
		throw error;
	}
	delete playersAwaitingForm[receiver.id];
	if (!Object.keys(playersAwaitingForm).length) world.beforeEvents.playerLeave.unsubscribe(leaveCallback);
	return response;
}