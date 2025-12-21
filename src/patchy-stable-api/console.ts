import { CommandPermissionLevel, Player, system, world } from "@minecraft/server";
import { ModalForm } from "./libraries/form";
import { storage } from "./libraries/properties";

export function jsonifyMap(map: Map<any, any>) {
	const object = {};
	map.forEach((value, key) => {
		if (value instanceof Map) {
			return object[key] = jsonifyMap(value);
		}
		object[key] = value;
	});
	return object;
}
function consoleStringify(arg: any) {
	if (arg instanceof Error) return arg;
	if (arg instanceof Map) return JSON.stringify(jsonifyMap(arg));
	if (arg instanceof Object || Array.isArray(arg)) {
		return JSON.stringify(arg, (key, value) => value instanceof Map ? jsonifyMap(value) : value);
	}
	return arg;
}
let worldLoaded = false;
world.afterEvents.worldLoad.subscribe(() => {
	worldLoaded = true;
});
const consoleWarn = console.warn;
const argsReformat = (consoleFunction, args) => {
	let shouldTrace;
	let shouldReformat = true;
	let logType = "any";
	let logSpecificKey = "";
	try {
		if (worldLoaded) {
			const worldStorage = storage.get();
			shouldTrace = worldStorage.getBoolean("shouldTrace");
			shouldReformat = worldStorage.getBoolean("shouldReformat") ?? true;
			logType = worldStorage.getString("logType") ?? "any";
			logSpecificKey = worldStorage.getString("logSpecificKey") ?? "";
		}
	} catch {

	}
	if (logType === "none") return;
	if (logType === "specific" && !args?.[0]?.includes?.(`~${logSpecificKey}~`)) return;
	if (!args || !args.length) consoleFunction();
	if (!shouldReformat) return consoleFunction(args);
	const argsFormatted = args.map((arg) => consoleStringify(arg));
	if (shouldTrace) {
		const path = executionPath();
		argsFormatted.push(path);
	}
	consoleFunction(argsFormatted);
};
console.warn = (...args) => {
	argsReformat(consoleWarn, args);
};
const consoleLog = console.log;
console.log = (...args) => {
	argsReformat(consoleLog, args);
};
const consoleInfo = console.info;
console.info = (...args) => {
	argsReformat(consoleInfo, args);
};
function executionPath() {
	try {
		throw new Error("");
	} catch (error: any) {
		return error.stack.split("\n").slice(2).join('\n');
	}
}
const logTypes = ["none", "specific", "any"];
/**
 * 
 * @param {Player} receiver 
 * @returns 
 */
export async function showConsoleForm(receiver) {
	const worldStorage = storage.get();
	const shouldTrace = worldStorage.getBoolean("shouldTrace");
	worldStorage.booleans.shouldReformat ??= true;
	const shouldReformat = worldStorage.getBoolean("shouldReformat");
	const logType = worldStorage.getString("logType") ?? "any";
	const logSpecificKey = worldStorage.getString("logSpecificKey");
	// console.warn("~test~", { shouldTrace, shouldReformat, logType, logSpecificKey });
	return new ModalForm()
		.toggle("shouldTrace", { defaultValue: shouldTrace }).callback((player, data) => {
			if (data === shouldTrace) return;
			worldStorage.setBoolean("shouldTrace", data);
		}).toggle("shouldReformat", { defaultValue: shouldReformat }).callback((player, data) => {
			if (data === shouldReformat) return;
			worldStorage.setBoolean("shouldReformat", data);
		}).dropdown("logType", logTypes, { defaultValueIndex: Math.max(logTypes.findIndex(type => logType.includes(type)), 0) }).callback((player, data) => {
			const type = logTypes[data];
			worldStorage.setString("logType", type);
		})
		.textField(`specific log key (if applicable):`, "", { defaultValue: logSpecificKey ?? "" }).callback((player, data) => {
			const logType = worldStorage.getString("logType") ?? "any";
			consoleWarn(logType, data);
			if (logType === "specific") worldStorage.setString("logSpecificKey", `${data}`);
		}).showAwaitNotBusy(receiver);
}
system.beforeEvents.startup.subscribe((event) => {
	event.customCommandRegistry.registerCommand({ description: "shows console settings form", name: "apotheosis:console", permissionLevel: CommandPermissionLevel.Admin }, (origin) => {
		const { sourceEntity } = origin;
		if (!(sourceEntity instanceof Player)) return;
		system.runTimeout(() => showConsoleForm(sourceEntity), 2);
	});
});