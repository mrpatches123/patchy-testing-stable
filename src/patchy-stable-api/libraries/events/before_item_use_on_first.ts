import { ItemUseOnBeforeEvent, ItemUseOnBeforeEventSignal, Player, system, world } from "@minecraft/server";
export class BeforeItemUseOnFirstEvent {
	protected currentSubscribeId = 0;
	protected subscriptions: Record<number, (Parameters<typeof world.beforeEvents.itemUseOn.subscribe>[0])> = {};
	protected currentSubscribes = 0;
	protected runId: number | undefined;
	protected playerData: Record<string, { using?: boolean, used?: boolean; }> = {};
	protected itemUseOnCallback: Parameters<typeof world.beforeEvents.itemUseOn.subscribe>[0] = (event) => {
		const { source } = event;
		if (!(source instanceof Player)) return;
		this.playerData[source.id] ??= {};
		const { using, used } = this.playerData[source.id];
		this.playerData[source.id].using = true;
		if (used) return;
		this.playerData[source.id].used = true;
		console.warn(JSON.stringify({ playerData: this.playerData }));
		Object.values(this.subscriptions).forEach((callback) => {
			callback(event);
		});
	};
	protected playerLeaveCallback: Parameters<typeof world.beforeEvents.playerLeave.subscribe>[0] = (event) => {
		delete this.playerData[event.player.id];
	};
	subscribe(callback: Parameters<typeof world.beforeEvents.itemUseOn.subscribe>[0]): number {
		const subscribeId = this.currentSubscribeId++;
		this.subscriptions[subscribeId] = callback;
		this.currentSubscribes++;
		this.subscribeSystem();
		return subscribeId;
	}
	subscribeSystem() {
		if (this.runId) return;
		this.runId = system.runInterval(() => {
			world.getAllPlayers().forEach((player) => {
				const { used, using } = this.playerData[player.id] ?? {};
				if (!using) this.playerData[player.id] = {};
				this.playerData[player.id].using = false;
			});
		});
		world.beforeEvents.itemUseOn.subscribe(this.itemUseOnCallback);
		world.beforeEvents.playerLeave.subscribe(this.playerLeaveCallback);
	}
	unsubscribeSystem() {
		if (!this.runId) return;
		system.clearRun(this.runId);
		try {
			world.beforeEvents.playerLeave.unsubscribe(this.playerLeaveCallback);
		} catch {

		}
		try {
			world.beforeEvents.itemUseOn.unsubscribe(this.itemUseOnCallback);
		} catch {
		}
		this.runId = undefined;
	}
	unsubscribe(id: number): void {
		if (--this.currentSubscribes <= 0) {
			this.unsubscribeSystem();
		}
		delete this.subscriptions[id];
	}
}
export const beforeItemUseOnFirst = new BeforeItemUseOnFirstEvent();