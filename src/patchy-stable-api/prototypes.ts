import { BlockType, CommandPermissionLevel, CommandResult, CustomCommand, CustomCommandParamType, CustomCommandRegistry, CustomCommandResult, CustomCommandStatus, Entity, EntityType, ItemType, Player, system, Vector3, } from "@minecraft/server";

export type CustomCommandParamsMapping = {
	[CustomCommandParamType.EntityType]: EntityType;
	[CustomCommandParamType.Enum]: string;
	[CustomCommandParamType.PlayerSelector]: Player[];
	[CustomCommandParamType.String]: string;
	[CustomCommandParamType.Integer]: number;
	[CustomCommandParamType.Boolean]: boolean;
	[CustomCommandParamType.EntitySelector]: Entity[];
	[CustomCommandParamType.BlockType]: BlockType;
	[CustomCommandParamType.ItemType]: ItemType;
	[CustomCommandParamType.Location]: Vector3;
	[CustomCommandParamType.Float]: number;
};

export type ExtractParamTypes<T extends { type: CustomCommandParamType; }[]> = {
	[K in keyof T]: T[K] extends { type: infer P; }
	? P extends CustomCommandParamType
	? CustomCommandParamsMapping[P]
	: never
	: never;
} extends infer U ? U extends any[] ? U : never : never;
export type ExtractParamTypesOptional<T extends { type: CustomCommandParamType; }[]> = {
	[K in keyof T]: T[K] extends { type: infer P; }
	? P extends CustomCommandParamType
	? CustomCommandParamsMapping[P] | undefined
	: never
	: never;
} extends infer U ? U extends any[] ? U : never : never;
declare module "@minecraft/server" {
	interface CustomCommandRegistry {
		/**
		 * Registers a custom command with the given parameters and callback function.
		 * Make sure to as const the parameters to ensure type safety and proper inference of types.
		 */
		registerCommand<M extends { name: string; type: CustomCommandParamType; }[], O extends { name: string; type: CustomCommandParamType; }[]>(
			args: CustomCommand & {
				mandatoryParameters?: M;
				optionalParameters?: O;
			},
			cb: (origin: CustomCommandOrigin, ...data: [...ExtractParamTypes<M>, ...ExtractParamTypesOptional<O>]) => CustomCommandResult | undefined,
		): void;
	}
}
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
