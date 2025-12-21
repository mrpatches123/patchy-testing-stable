import { Player, system, world } from "@minecraft/server";
import { customEvents } from "patchy-stable-api/libraries/events";
import { storage } from "patchy-stable-api/libraries/properties";
import { overworld } from "patchy-stable-api/libraries/utilities";
import { getGameRulesForm } from "patchy-vanilla-tweaks/forms/gamerule";
import { subscribeChunkSystem } from "./chunk";
const worldStrorage = storage.get();
customEvents.worldInitialize.subscribe(() => {
    const { gamerules = {} } = worldStrorage.jsons;
    Object.entries(gamerules).forEach(([gamerule, value]) => {
        if (gamerule === "difficulty") {
            overworld.runCommand(`difficulty ${value}`);
        }
        else
            world.gameRules[gamerule] = value;
    });
});
const opped = ["mrpatches123", "mrpootches123"];
try {
    world.scoreboard.addObjective("showChunks");
}
catch { }
world.beforeEvents.itemUse.subscribe(async (event) => {
    try {
        const { source, itemStack } = event;
        if (!(source instanceof Player))
            return;
        if (opped.includes(source.name))
            return;
        await system.waitTicks(1);
        switch (itemStack.nameTag) {
            case "gamerule": {
                await getGameRulesForm(source).show(source);
                break;
            }
            case "chunks": {
                subscribeChunkSystem();
                const playerStorage = storage.get(source);
                const { showChunks } = playerStorage.scores;
                playerStorage.scores.showChunks = (showChunks) ? 0 : 1;
                console.warn(playerStorage.scores.showChunks);
            }
        }
    }
    catch (error) {
        console.warn(error, error.stack);
    }
});
