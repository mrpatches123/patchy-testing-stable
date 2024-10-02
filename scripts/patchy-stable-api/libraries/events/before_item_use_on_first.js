import { Player, system, world } from "@minecraft/server";
export class BeforeItemUseOnFirstEvent {
    currentSubscribeId = 0;
    subscriptions = {};
    currentSubscribes = 0;
    runId;
    playerData = {};
    itemUseOnCallback = (event) => {
        const { source } = event;
        if (!(source instanceof Player))
            return;
        this.playerData[source.id] ??= {};
        const { using, used } = this.playerData[source.id];
        this.playerData[source.id].using = true;
        if (used)
            return;
        this.playerData[source.id].used = true;
        console.warn(JSON.stringify({ playerData: this.playerData }));
        Object.values(this.subscriptions).forEach((callback) => {
            callback(event);
        });
    };
    playerLeaveCallback = (event) => {
        delete this.playerData[event.player.id];
    };
    subscribe(callback) {
        const subscribeId = this.currentSubscribeId++;
        this.subscriptions[subscribeId] = callback;
        this.currentSubscribes++;
        this.subscribeSystem();
        return subscribeId;
    }
    subscribeSystem() {
        if (this.runId)
            return;
        this.runId = system.runInterval(() => {
            world.getAllPlayers().forEach((player) => {
                const { used, using } = this.playerData[player.id] ?? {};
                if (!using)
                    this.playerData[player.id] = {};
                this.playerData[player.id].using = false;
            });
        });
        world.beforeEvents.itemUseOn.subscribe(this.itemUseOnCallback);
        world.beforeEvents.playerLeave.subscribe(this.playerLeaveCallback);
    }
    unsubscribeSystem() {
        if (!this.runId)
            return;
        system.clearRun(this.runId);
        try {
            world.beforeEvents.playerLeave.unsubscribe(this.playerLeaveCallback);
        }
        catch {
        }
        try {
            world.beforeEvents.itemUseOn.unsubscribe(this.itemUseOnCallback);
        }
        catch {
        }
        this.runId = undefined;
    }
    unsubscribe(id) {
        if (--this.currentSubscribes <= 0) {
            this.unsubscribeSystem();
        }
        delete this.subscriptions[id];
    }
}
export const beforeItemUseOnFirst = new BeforeItemUseOnFirstEvent();
