import { world, Player, Vector3, system, ItemStack, EntityInventoryComponent, Dimension, Entity, EntityQueryOptions, Block } from "@minecraft/server";
import { Vector } from "./vector";


export const overworld = world.getDimension("overworld");
export const nether = world.getDimension("nether");
export const end = world.getDimension("the_end");
try {
	world.scoreboard.addObjective("test");
} catch (e) { }
export function fixPlayerScore(player: Player) {
	if (!player.scoreboardIdentity)
		player.runCommand('scoreboard players set @s test 0');
}
export function iterateObject<T extends Record<string, any>>(obj: T, callback: (key: keyof T, value: T[keyof T], i: number) => void) {
	let i = 0;
	const objectPrototype = Object.getPrototypeOf({});
	for (const key in obj) {
		if (key in objectPrototype) continue;
		callback(key, obj[key], i++);
	}
}
export function isDefined<T>(value: T | undefined): value is T {
	return value !== undefined && value !== null && typeof value !== 'number' || Number.isFinite(value);
}
export function isVector3(value: any): value is Vector3 {
	return typeof value.x === 'number' && typeof value.y === 'number' && typeof value.z === 'number';
}
export function chunkString(str: string, length: number) {
	let size = (str.length / length) | 0;
	const array: string[] = Array(++size);
	for (let i = 0, offset = 0; i < size; i++, offset += length) {
		array[i] = str.substr(offset, length);
	}
	return array;
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
	const messageLength = message.length;
	let finding: boolean | string = false;
	let braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0;
	let started = false;
	let o = 0;
	const output = [];
	for (let i = prefix.length; i < messageLength; i++) {
		const char = message[i];
		switch (char) {
			case '{':
				switch (finding) {
					case 'json':
						break;
					default:
						braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
						output.push('');
						o++;
						finding = 'json';
						break;

				}
				output[o] += char;
				braceCount[0]++;
				break;
			case '}':
				output[o] += char;
				if (braceCount[0] !== ++braceCount[1] || bracketCount[0] !== bracketCount[1] || (quoteCount && quoteCount & 1)) break;
				braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
				break;
			case ']':
				output[o] += char;
				if (bracketCount[0] !== ++bracketCount[1] || braceCount[0] !== braceCount[1] || (quoteCount && quoteCount & 1)) break;
				braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
				break;
			case '"':
				switch (finding) {
					case 'json':
						output[o] += char;
						break;
					default:
						braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
						finding = 'string';
					case 'string':
						if (!(++quoteCount & 1)) { finding = false; break; };
						if (!output[o].length) break;
						output.push('');
						o++;
						break;
				}
				break;
			case '[':
				switch (finding) {
					case 'json':
						break;
					default:
						output.push('');
						o++;
						finding = 'json';
						break;

				}
				output[o] += char;
				bracketCount[0]++;
				break;
			case ' ':
				switch (finding) {
					case 'string':
					case 'json':
						if (!(quoteCount & 1)) break;
						output[o] += char;
						break;
					default:
						const nextChar = message?.[i + 1];
						switch (nextChar) {
							case ' ':
							case '[':
							case '{':
							case '"':
								break;
							default:
								output.push('');
								o++;
								finding = 'word';
								break;
						}
						break;
				}
				break;
			default:
				if (!started) {
					started = true;
					finding = 'word';
					output.push('');
					spaceCount = 1;
				}
				switch (char) {
					case '@':
						if (finding === 'string') {
							output[o] += char;
							break;
						}
						const nextChar = message?.[i + 1];
						switch (nextChar) {
							case '"':
								break;
							default:
								const afterNextChar = message?.[i + 2];
								switch (afterNextChar) {
									case ' ':
										finding = 'string';
										output[o] += char;
										break;
									case '[':
										finding = 'json';
										output[o] += char;
										break;

								}
								break;
						}
						break;
					default:
						output[o] += char;
						break;
				}

				break;
		}
	}
	return output;
}
export async function sleep(ticks?: number): Promise<undefined> {
	return new Promise((resolve) => system.runTimeout(() => resolve(undefined), ticks));
}

export function cartesianToCircular(vector: Vector3, center: Vector3 = { x: 0, y: 0, z: 0 }) {
	const { x, z } = vector;
	const { x: xc, z: zc } = center;
	const xd = x - xc;
	const zd = z - zc;
	const r = Math.sqrt((xd) ** 2 + (zd) ** 2);
	let thetaT;
	if (zd >= 0) {
		thetaT = Math.atan2(zd, xd);
	} else {
		thetaT = 2 * Math.PI + Math.atan2(zd, xd);
	}
	return ({ theta: thetaT, r, x, z });
}
const PI2 = 2 * Math.PI;
export function differenceRadians(theta1: number, theta2: number) {
	const t1 = theta1 % (PI2);
	const t2 = theta2 % (PI2);
	let r1 = t1 - t2;
	let r2 = t1 - (t2 + PI2);
	return (Math.abs(r1) > Math.abs(r2)) ? r2 : r1;

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
	let entity: Entity | undefined;
	try {
		try {
			entity = dimension.spawnEntity(typeId, location);
		} catch (error: any) {
			console.warn('ingore', error, error.stack);
		}
		let tickAreaCreated = false;
		console.warn(entity?.isValid() ?? "");
		entity = ((entity && !entity.isValid()) ? entity : await new Promise(async (resolve) => {
			const { x, y, z } = location;
			if (tickingArea) {
				tickAreaCreated = true;
				await dimension.runCommandAsync(`tickingarea add ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} spawnEntityAsyncTick`);
			}
			const runId = system.runInterval(async () => {
				try {
					entity = (!entity) ? dimension.spawnEntity(typeId, location) : entity;
					if (!entity) return;
					if (!entity.isValid()) return;
					system.clearRun(runId);

					resolve(entity);
				} catch (error: any) {
					console.warn('ingore', error, error.stack);
				}
			});
		}))!;

		await callback?.(entity);
		if (tickAreaCreated) await dimension.runCommandAsync(`tickingarea remove spawnEntityAsyncTick`);

	} catch (error: any) {
		console.warn('ingore', error, error.stack);
	}
	return entity!;
}
/**
 * Entity may not be loaded once 
 */
export async function spawnItemAsync(dimension: Dimension, itemStack: ItemStack, location: Vector3, callback?: (entity: Entity) => void | Promise<void>, tickingArea: boolean = true): Promise<Entity> {
	let entity: Entity | undefined;
	try {
		try {
			entity = dimension.spawnItem(itemStack, location);
		} catch (error: any) {
			console.warn('ingore', error, error.stack);
		}
		let tickAreaCreated = false;
		console.warn(entity?.isValid() ?? "");
		entity = ((entity && !entity.isValid()) ? entity : await new Promise(async (resolve) => {
			const { x, y, z } = location;
			if (tickingArea) {
				tickAreaCreated = true;
				await dimension.runCommandAsync(`tickingarea add ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} spawnEntityAsyncTick`);
			}
			const runId = system.runInterval(async () => {
				try {
					entity = (!entity) ? dimension.spawnItem(itemStack, location) : entity;
					if (!entity) return;
					if (!entity.isValid()) return;
					system.clearRun(runId);

					resolve(entity);
				} catch (error: any) {
					console.warn('ingore', error, error.stack);
				}
			});
		}))!;

		await callback?.(entity);
		if (tickAreaCreated) dimension.runCommandAsync(`tickingarea remove spawnEntityAsyncTick`);

	} catch (error: any) {
		console.warn('ingore', error, error.stack);
	}
	return entity!;
}
export async function getEntityAsync(dimension: Dimension, entityQueryOptions: EntityQueryOptions, callback?: (entity: Entity | undefined) => void | Promise<void>, timeoutTicks = Infinity, tickingArea: boolean = true): Promise<Entity | undefined> {
	let entity: Entity | undefined;
	try {
		if (!entityQueryOptions.location) throw new Error('location is required');
		entityQueryOptions.closest = 1;
		const { x, y, z } = entityQueryOptions.location;

		try {
			entity = dimension.getEntities(entityQueryOptions)[0];
		} catch (error: any) {
			console.warn('ingore', error, error.stack);
		}
		let tickAreaCreated = false;
		let i = 0;
		entity = ((entity && !entity.isValid()) ? entity : await new Promise(async (resolve) => {
			if (tickingArea) {
				tickAreaCreated = true;
				await dimension.runCommandAsync(`tickingarea add ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} spawnEntityAsyncTick`);
			}
			const runId = system.runInterval(async () => {
				if (i++ > timeoutTicks) {
					system.clearRun(runId);
					resolve(entity);
				}
				try {
					entity = (!entity) ? dimension.getEntities(entityQueryOptions)[0] : entity;
					if (!entity) return;
					if (!entity.isValid()) return;
					system.clearRun(runId);

					resolve(entity);
				} catch (error: any) {
					console.warn('ingore', error, error.stack);
				}
			});
		}))!;

		await callback?.(entity);
		if (tickAreaCreated) await dimension.runCommandAsync(`tickingarea remove spawnEntityAsyncTick`);

	} catch (error: any) {
		console.warn('ingore', error, error.stack);
	}
	return entity;
}
export async function getBlockArrayAsync(dimension: Dimension, blockLocations: Vector3[], callback?: (blocks: Block[]) => void | Promise<void>, tickingArea: boolean = true): Promise<Block[]> {
	try {
		let locations = [Vector.minVectors(blockLocations).toVector3(), Vector.minVectors(blockLocations).toVector3()];
		let blocks: (Block | undefined)[] = Array(blockLocations.length);
		let tickingAreaCreated = false;
		async function createTickingArea() {
			if (!tickingArea || tickingAreaCreated) return;
			tickingAreaCreated = true;
			await dimension.runCommandAsync(`tickingarea add ${Math.floor(locations[0].x)} ${Math.floor(locations[0].y)} ${Math.floor(locations[0].z)} ${Math.floor(locations[1].x)} ${Math.floor(locations[1].y)} ${Math.floor(locations[1].z)} getBlockAsyncTick`);
		}
		async function removeTickingArea() {
			if (!tickingAreaCreated) return;
			await dimension.runCommandAsync(`tickingarea remove getBlockAsyncTick`);
		}
		for (let i = 0; i < blockLocations.length; i++) {
			let location = blockLocations[i];
			let block: Block | undefined;
			try {
				try {
					block = dimension.getBlock(location);
				} catch (error: any) {
					console.warn('ingore', error, error.stack);
				}
				block = ((block && !block.isValid()) ? block : await new Promise(async (resolve) => {
					try {
						await createTickingArea();
						const runId = system.runInterval(async () => {
							try {
								block = (!block) ? dimension.getBlock(location) : block;
								if (!block) return;
								if (!block.isValid()) return;
								system.clearRun(runId);

								resolve(block);
							} catch (error: any) {
								console.warn('ingore', error, error.stack);
							}
						});
					} catch (error: any) {
						console.warn('ingore', error, error.stack);
					}
				}))!;
				blocks[i++] = block;
			} catch (error: any) {
				console.warn('ingore', error, error.stack);
			}

		}
		await removeTickingArea();
		callback?.(blocks as Block[]);

		return (blocks as Block[])!;
	} catch (error: any) {
		console.warn('ingore', error, error.stack);
	}
	return [];
}
export async function getBlocksAsync(dimension: Dimension, blockLocations: Vector3 | [Vector3, Vector3], callback?: (blocks: Block[]) => void | Promise<void>, tickingArea: boolean = true): Promise<Block[]> {
	try {
		let locations: [Vector3, Vector3];
		if (isVector3(blockLocations)) locations = [blockLocations, blockLocations];
		else {
			locations = [Vector.min(blockLocations[0], blockLocations[1]).toVector3(), Vector.max(blockLocations[0], blockLocations[1]).toVector3()];
		}
		let blocks: (Block | undefined)[] = Array(Vector.areaBetweenFloored(locations[0], locations[1]));
		let tickingAreaCreated = false;
		async function createTickingArea() {
			if (!tickingArea || tickingAreaCreated) return;
			tickingAreaCreated = true;
			await dimension.runCommandAsync(`tickingarea add ${Math.floor(locations[0].x)} ${Math.floor(locations[0].y)} ${Math.floor(locations[0].z)} ${Math.floor(locations[1].x)} ${Math.floor(locations[1].y)} ${Math.floor(locations[1].z)} getBlockAsyncTick`);
		}
		async function removeTickingArea() {
			if (!tickingAreaCreated) return;
			await dimension.runCommandAsync(`tickingarea remove getBlockAsyncTick`);
		}
		for (let i = 0, x = locations[0].x; x <= locations[1].x; x++) {
			for (let y = locations[0].y; y <= locations[1].y; y++) {
				for (let z = locations[0].z; z <= locations[1].z; z++, i++) {
					let block: Block | undefined;
					const location = { x, y, z };
					try {
						try {
							block = dimension.getBlock(location);
						} catch (error: any) {
							console.warn('ingore', error, error.stack);
						}
						block = ((block && !block.isValid()) ? block : await new Promise(async (resolve) => {
							try {
								await createTickingArea();
								const runId = system.runInterval(async () => {
									try {
										block = (!block) ? dimension.getBlock(location) : block;
										if (!block) return;
										if (!block.isValid()) return;
										system.clearRun(runId);

										resolve(block);
									} catch (error: any) {
										console.warn('ingore', error, error.stack);
									}
								});
							} catch (error: any) {
								console.warn('ingore', error, error.stack);
							}
						}))!;
						blocks[i++] = block;
					} catch (error: any) {
						console.warn('ingore', error, error.stack);
					}
				}
			}
		}
		await removeTickingArea();
		callback?.(blocks as Block[]);

		return (blocks as Block[])!;
	} catch (error: any) {
		console.warn('ingore', error, error.stack);
	}
	return [];
}
