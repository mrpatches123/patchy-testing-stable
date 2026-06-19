import { system, world } from "@minecraft/server";
import { Timer } from "../../patchy-stable-api/libraries/time";
const TIMER_KEY = "test_up_timer";
system.runInterval(() => {
	world.getAllPlayers().forEach(player => {
		let timer = Timer.getFromEntity(player, TIMER_KEY);
		if (timer === false) return;
		console.warn(Boolean(timer));
		timer ??= new Timer();
		console.warn({ TIMER_KEY, time: timer.getTime() });
		timer.saveToEntity(player, TIMER_KEY);

	});
});