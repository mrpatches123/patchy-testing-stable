import { system } from "@minecraft/server";
system.beforeEvents.startup.subscribe((event) => {
    event.blockComponentRegistry.registerCustomComponent("patches:placer", {
        onTick: (event) => {
            const { block, dimension } = event;
        }
    });
});
