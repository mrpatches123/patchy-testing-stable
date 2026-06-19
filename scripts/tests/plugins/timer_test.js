import { system, world } from "@minecraft/server";
import { Timer } from "../../patchy-stable-api/libraries/time";
const TIMER_KEY = "test_up_timer";
system.runInterval(() => {
    world.getAllPlayers().forEach(player => {
        let timer = Timer.getFromEntity(player, TIMER_KEY);
        if (timer === false)
            return;
        console.warn(Boolean(timer), timer === undefined);
        timer ??= new Timer();
        const time = timer.getTime();
        console.warn({ TIMER_KEY, time });
        if (!time)
            timer.saveToEntity(player, TIMER_KEY);
        if (time > 1000) {
            console.warn("restart");
            timer.restart();
            timer.saveToEntity(player, TIMER_KEY);
        }
    });
});
