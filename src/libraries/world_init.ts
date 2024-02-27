import { system, world } from "@minecraft/server";

class WorldInitialiseEvent {
	subscriptions: (() => void)[] = [];
	subscribe(callback: () => void): void {
		this.subscriptions.push(callback);
	}
	constructor() {
		const thisWorldInit = this;
		function run() {
			system.run(async () => {
				try {
					const player = world.getPlayers()[0];
					if (!player) return run();
					const { successCount } = await player.runCommandAsync("testfor @s");
					if (!successCount) return run();
					console.warn('world_initialised');
					thisWorldInit.subscriptions.forEach((callback) => callback());
				} catch (error: any) {
					console.warn(error, error.stack);
				}
			});
		}
		run();
	}
}
export const worldInitialise = new WorldInitialiseEvent();