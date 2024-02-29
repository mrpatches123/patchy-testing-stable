import { system, world } from "@minecraft/server";
import { iterateObject } from "libraries/utilities";
class WorldInitializeEvent {
    constructor() {
        this.currentSubscribeId = 0;
        this.subscriptions = {};
        this.currentSubscribes = 0;
    }
    subscribe(callback) {
        const subscribeId = this.currentSubscribeId++;
        this.subscriptions[subscribeId] = callback;
        this.currentSubscribes++;
        this.subscribeSystem();
        return subscribeId;
    }
    subscribeSystem() {
        const thisWorldInit = this;
        if (this.runId)
            return;
        this.runId = system.runInterval(async () => {
            try {
                const player = world.getPlayers()[0];
                if (!player)
                    return;
                const { successCount } = await player.runCommandAsync("testfor @s");
                if (!successCount)
                    return;
                console.warn('world_initialised');
                iterateObject(thisWorldInit.subscriptions, (id, callback) => callback());
            }
            catch (error) {
                console.warn(error, error.stack);
            }
        });
    }
    unsubscribeSystem() {
        if (!this.runId)
            return;
        system.clearRun(this.runId);
        this.runId = undefined;
    }
    unsubscribe(id) {
        if (--this.currentSubscribes <= 0) {
            this.unsubscribeSystem();
        }
        delete this.subscriptions[id];
    }
}
export const worldInitialize = new WorldInitializeEvent();
