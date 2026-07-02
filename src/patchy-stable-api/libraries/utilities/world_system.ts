import { Block, Dimension, DimensionTypes, Entity, EntityQueryOptions, ItemStack, Player, system, Vector3, world } from "@minecraft/server";
import { Vector } from "../vector";
import { worldInitialize } from "../events/world_initialize";
import { MiscUtilities } from "./misc";

export class WorldSystemUtilities {
	static overworld: Dimension;
	static nether: Dimension;
	static end: Dimension;
	static dimensions: Dimension[];
	static fixPlayerScore(player: Player) {
		if (!player.scoreboardIdentity)
			player.runCommand('scoreboard players set @s testkjjkfkejwkjf 0');
	}
	static init() {
		worldInitialize.subscribe(() => {
			WorldSystemUtilities.overworld = world.getDimension("overworld");
			WorldSystemUtilities.nether = world.getDimension("nether");
			WorldSystemUtilities.end = world.getDimension("the_end");
			WorldSystemUtilities.dimensions = DimensionTypes.getAll().map(type => world.getDimension(type.typeId));
		});
	}
	/**
	 * Entity may not be loaded once 
	 */
	static async spawnEntityAsync(dimension: Dimension, typeId: string, location: Vector3, callback?: (entity: Entity) => void | Promise<void>, tickingArea: boolean = true): Promise<Entity> {
		let entity: Entity | undefined;
		try {

			try {
				entity = dimension.spawnEntity(typeId, location);
			} catch (error: any) {
				console.warn('ingore', error, error.stack);
			}
			let tickAreaCreated = false;
			entity = ((entity && entity.isValid) ? entity : await new Promise(async (resolve) => {
				let tickingAreaRemoved = false;
				try {
					const commandResult = dimension.runCommand(`tickingarea remove spawnEntityAsyncTick`);
					tickingAreaRemoved = Boolean(commandResult.successCount);
				} catch { }
				if (tickingAreaRemoved) await system.waitTicks(1);
				const { x, y, z } = location;
				if (tickingArea) {
					tickAreaCreated = true;
					await dimension.runCommand(`tickingarea add ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} spawnEntityAsyncTick`);
				}
				const cancelRun = WorldSystemUtilities.systemRunIntervalAwaitCallback(async () => {
					try {
						entity = (!entity) ? dimension.spawnEntity(typeId, location) : entity;
						if (!entity) return;
						if (!entity.isValid) return;
						cancelRun();

						resolve(entity);
					} catch (error: any) {
						console.warn('ingore', error, error.stack);
					}
				});
			}))!;

			await callback?.(entity);
			if (tickAreaCreated) dimension.runCommand(`tickingarea remove spawnEntityAsyncTick`);

		} catch (error: any) {
			console.warn('ingore', error, error.stack);
		}
		return entity!;
	}
	/**
	 * Entity may not be loaded once 
	 */
	static async spawnItemAsync(dimension: Dimension, itemStack: ItemStack, location: Vector3, callback?: (entity: Entity) => void | Promise<void>, tickingArea: boolean = true): Promise<Entity> {
		let entity: Entity | undefined;
		try {
			try {
				entity = dimension.spawnItem(itemStack, location);
			} catch (error: any) {
				console.warn('ingore', error, error.stack);
			}
			let tickAreaCreated = false;
			entity = ((entity && entity.isValid) ? entity : await new Promise(async (resolve) => {
				let tickingAreaRemoved = false;
				try {
					const commandResult = dimension.runCommand(`tickingarea remove spawnItemAsyncTick`);
					tickingAreaRemoved = Boolean(commandResult.successCount);
				} catch { }
				if (tickingAreaRemoved) await system.waitTicks(1);
				const { x, y, z } = location;
				if (tickingArea) {
					tickAreaCreated = true;
					await dimension.runCommand(`tickingarea add ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} spawnItemAsyncTick`);
				}
				const cancelRun = WorldSystemUtilities.systemRunIntervalAwaitCallback(async () => {
					try {
						entity = (!entity) ? dimension.spawnItem(itemStack, location) : entity;
						if (!entity) return;
						if (!entity.isValid) return;
						cancelRun();

						resolve(entity);
					} catch (error: any) {
						console.warn('ingore', error, error.stack);
					}
				});
			}))!;

			await callback?.(entity);
			if (tickAreaCreated) dimension.runCommand(`tickingarea remove spawnItemAsyncTick`);

		} catch (error: any) {
			console.warn('ingore', error, error.stack);
		}
		return entity!;
	}
	static async getEntityAsync(dimension: Dimension, entityQueryOptions: EntityQueryOptions, callback?: (entity: Entity | undefined) => void | Promise<void>, timeoutTicks = Infinity, tickingArea: boolean = true): Promise<Entity | undefined> {
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
			entity = ((entity && entity.isValid) ? entity : await new Promise(async (resolve) => {
				let tickingAreaRemoved = false;
				try {
					const commandResult = dimension.runCommand(`tickingarea remove getEntityAsyncTick`);
					tickingAreaRemoved = Boolean(commandResult.successCount);
				} catch { }
				if (tickingAreaRemoved) await system.waitTicks(0);
				if (tickingArea) {
					tickAreaCreated = true;
					await dimension.runCommand(`tickingarea add ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} getEntityAsyncTick`);
				}
				const cancelRun = WorldSystemUtilities.systemRunIntervalAwaitCallback(async () => {
					if (i++ > timeoutTicks) {
						cancelRun();
						resolve(entity);
					}
					try {
						entity = (!entity || !entity.isValid) ? dimension.getEntities(entityQueryOptions)[0] : entity;
						if (!entity) return;
						if (!entity.isValid) return;
						cancelRun();

						resolve(entity);
					} catch (error: any) {
						console.warn('ingore', error, error.stack);
					}
				});
			}))!;

			await callback?.(entity);
			if (tickAreaCreated) dimension.runCommand(`tickingarea remove getEntityAsyncTick`);

		} catch (error: any) {
			console.warn('ingore', error, error.stack);
		}
		return entity;
	}
	static async getBlockArrayAsync(dimension: Dimension, blockLocations: Vector3[], callback?: (blocks: Block[]) => void | Promise<void>, tickingArea: boolean = true): Promise<Block[]> {
		try {
			let locations = [Vector.minVectors(blockLocations).toVector3(), Vector.maxVectors(blockLocations).toVector3()];
			let blocks: (Block | undefined)[] = Array(blockLocations.length);
			let tickingAreaCreated = false;
			async function createTickingArea() {
				if (!tickingArea || tickingAreaCreated) return;
				let tickingAreaRemoved = false;
				try {
					const commandResult = dimension.runCommand(`tickingarea remove getBlockAsyncTick`);
					tickingAreaRemoved = Boolean(commandResult.successCount);
				} catch { }
				if (tickingAreaRemoved) await system.waitTicks(0);
				tickingAreaCreated = true;
				await dimension.runCommand(`tickingarea add ${Math.floor(locations[0].x)} ${Math.floor(locations[0].y)} ${Math.floor(locations[0].z)} ${Math.floor(locations[1].x)} ${Math.floor(locations[1].y)} ${Math.floor(locations[1].z)} getBlockAsyncTick`);
			}
			async function removeTickingArea() {
				if (!tickingAreaCreated) return;
				await dimension.runCommand(`tickingarea remove getBlockAsyncTick`);
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
					block = ((block && block.isValid) ? block : await new Promise(async (resolve) => {
						try {
							await createTickingArea();
							const cancelRun = WorldSystemUtilities.systemRunIntervalAwaitCallback(async () => {
								try {
									block = (!block) ? dimension.getBlock(location) : block;
									if (!block) return;
									if (!block.isValid) return;
									cancelRun();

									resolve(block);
								} catch (error: any) {
									console.warn('ingore', error, error.stack);
								}
							});
						} catch (error: any) {
							console.warn('ingore', error, error.stack);
						}
					}))!;
					blocks[i] = block;
				} catch (error: any) {
					console.warn('ingore', error, error.stack);
				}

			}
			callback?.(blocks as Block[]);
			await removeTickingArea();

			return (blocks as Block[])!;
		} catch (error: any) {
			console.warn('ingore', error, error.stack);
		}
		return [];
	}
	static async spawnEntityArrayAsync(dimension: Dimension, entitySpawnData: { typeId: string, location: Vector3; }[], callback?: (blocks: Entity[]) => void | Promise<void>, tickingArea: boolean = true): Promise<Entity[]> {
		try {
			const locationsArray = entitySpawnData.map(({ location }) => location);
			let locations = [Vector.minVectors(locationsArray).toVector3(), Vector.maxVectors(locationsArray).toVector3()];
			let entities: (Entity | undefined)[] = Array(entitySpawnData.length);
			let tickingAreaCreated = false;
			async function createTickingArea() {
				if (!tickingArea || tickingAreaCreated) return;
				let tickingAreaRemoved = false;
				try {
					const commandResult = dimension.runCommand(`tickingarea remove getBlockAsyncTick`);
					tickingAreaRemoved = Boolean(commandResult.successCount);
				} catch { }
				if (tickingAreaRemoved) await system.waitTicks(0);
				tickingAreaCreated = true;
				await dimension.runCommand(`tickingarea add ${Math.floor(locations[0].x)} ${Math.floor(locations[0].y)} ${Math.floor(locations[0].z)} ${Math.floor(locations[1].x)} ${Math.floor(locations[1].y)} ${Math.floor(locations[1].z)} getBlockAsyncTick`);
			}
			async function removeTickingArea() {
				if (!tickingAreaCreated) return;
				await dimension.runCommand(`tickingarea remove getBlockAsyncTick`);
			}
			for (let i = 0; i < entitySpawnData.length; i++) {
				let { location, typeId } = entitySpawnData[i];
				let entity: Entity | undefined;
				try {
					try {
						entity = dimension.spawnEntity(typeId, location);
					} catch (error: any) {
						console.warn('ingore', error, error.stack);
					}
					entity = ((entity && entity.isValid) ? entity : await new Promise(async (resolve) => {
						try {
							await createTickingArea();
							const cancelRun = WorldSystemUtilities.systemRunIntervalAwaitCallback(async () => {
								try {
									entity = (!entity) ? dimension.spawnEntity(typeId, location) : entity;
									if (!entity) return;
									if (!entity.isValid) return;
									cancelRun();

									resolve(entity);
								} catch (error: any) {
									console.warn('ingore', error, error.stack);
								}
							});
						} catch (error: any) {
							console.warn('ingore', error, error.stack);
						}
					}))!;
					entities[i] = entity;
				} catch (error: any) {
					console.warn('ingore', error, error.stack);
				}

			}
			callback?.(entities as Entity[]);
			await removeTickingArea();

			return (entities as Entity[])!;
		} catch (error: any) {
			console.warn('ingore', error, error.stack);
		}
		return [];
	}
	static async getBlocksAsync(dimension: Dimension, blockLocations: Vector3 | [Vector3, Vector3], callback?: (blocks: Block[]) => void | Promise<void>, tickingArea: boolean = true): Promise<Block[]> {
		try {
			let locations: [Vector3, Vector3];
			if (MiscUtilities.isVector3(blockLocations)) locations = [blockLocations, blockLocations];
			else {
				locations = [Vector.min(blockLocations[0], blockLocations[1]).toVector3(), Vector.max(blockLocations[0], blockLocations[1]).toVector3()];
			}
			let blocks: (Block | undefined)[] = Array(Vector.areaBetweenFloored(locations[0], locations[1]));
			let tickingAreaCreated = false;
			async function createTickingArea() {
				if (!tickingArea || tickingAreaCreated) return;
				console.warn('createdTickingArea');
				let tickingAreaRemoved = false;
				try {
					const commandResult = dimension.runCommand(`tickingarea remove getBlockAsyncTick`);
					tickingAreaRemoved = Boolean(commandResult.successCount);
				} catch { }
				if (tickingAreaRemoved) await system.waitTicks(1);
				tickingAreaCreated = true;
				await dimension.runCommand(`tickingarea add ${Math.floor(locations[0].x)} ${Math.floor(locations[0].y)} ${Math.floor(locations[0].z)} ${Math.floor(locations[1].x)} ${Math.floor(locations[1].y)} ${Math.floor(locations[1].z)} getBlockAsyncTick`);
			}
			async function removeTickingArea() {
				if (!tickingAreaCreated) return;
				await dimension.runCommand(`tickingarea remove getBlockAsyncTick`);
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
							block = ((block && block.isValid) ? block : await new Promise(async (resolve) => {
								try {
									await createTickingArea();
									const cancelRun = WorldSystemUtilities.systemRunIntervalAwaitCallback(async () => {
										try {
											block = (!block) ? dimension.getBlock(location) : block;
											if (!block) return;
											if (!block.isValid) return;
											cancelRun();

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
			callback?.(blocks as Block[]);
			await removeTickingArea();

			return (blocks as Block[])!;
		} catch (error: any) {
			console.warn('ingore', error, error.stack);
		}
		return [];
	}

	/**
	 * @param {() => void | Promise<void>} callback
	 * @param {number} tickDelay 
	 * @returns {() => void} cancel() run to cancel
	 */
	static systemRunIntervalAwaitCallback(callback: () => void | Promise<void>, tickDelay = 0): () => void {
		let stop = false;
		let currentId: number | undefined;
		const run = async () => {
			if (stop) return;
			// try {
			await callback();
			if (stop) return;
			currentId = system.runTimeout(run, tickDelay);
			// } catch (error: any) {
			// 	console.warn("Error below stack: ", error.stack);
			// 	throw error;
			// }
		};
		currentId = system.run(run);
		return () => {
			stop = true;
			if (MiscUtilities.isDefined(currentId)) system.clearRun(currentId);
		};
	}
}
WorldSystemUtilities.init();