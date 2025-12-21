import { CustomCommandParamType, } from "@minecraft/server";
// system.beforeEvents.startup.subscribe((event) => {
// 	event.customCommandRegistry.registerCommand(
// 		{
// 			name: "t:command",
// 			mandatoryParameters: [
// 				{ name: "player", type: CustomCommandParamType.PlayerSelector },
// 				{ name: "location", type: CustomCommandParamType.Location },
// 				{ name: "entity", type: CustomCommandParamType.EntitySelector }
// 			] as const,
// 			optionalParameters: [
// 				{ name: "message", type: CustomCommandParamType.String },
// 				{ name: "number", type: CustomCommandParamType.Integer }
// 			] as const,
// 			permissionLevel: CommandPermissionLevel.Any,
// 			description: "Test command for lore handling."
// 		},
// 		(...args) => {
// 			return {
// 				status: CustomCommandStatus.Success,
// 			};
// 		});
// });
// Example usage
