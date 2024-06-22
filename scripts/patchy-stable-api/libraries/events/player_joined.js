import { system, world } from "@minecraft/server";
import { fixPlayerScore, iterateObject } from "../utilities";
import { worldInitialize } from "./world_initialize";
export class PlayerJoinedEvent {
    currentSubscribeId = 0;
    subscriptions = {};
    currentSubscribes = 0;
    runId;
    loads = {};
    subscribe(callback) {
        const subscribeId = this.currentSubscribeId++;
        this.subscriptions[subscribeId] = callback;
        this.currentSubscribes++;
        this.subscribeSystem();
        return subscribeId;
    }
    subscribeSystem() {
        worldInitialize.subscribe(() => {
            world.getPlayers().forEach((player) => {
                this.runEvent(player);
            });
        });
        world.afterEvents.playerSpawn.subscribe((event) => {
            this.runEvent(event.player);
        });
        world.afterEvents.playerLeave.subscribe((event) => {
            delete this.loads[event.playerId];
        });
    }
    runEvent(player) {
        if (player.id in this.loads)
            return;
        fixPlayerScore(player);
        this.loads[player.id] = true;
        iterateObject(this.subscriptions, (id, callback) => callback({ player }));
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
export const playerJoined = new PlayerJoinedEvent();
//# sourceMappingURL=player_joined.js.map