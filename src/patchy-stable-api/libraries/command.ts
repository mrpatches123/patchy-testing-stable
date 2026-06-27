import {
	BlockType,
	CommandPermissionLevel,
	CommandResult,
	CustomCommand,
	CustomCommandOrigin,
	CustomCommandParameter,
	CustomCommandParamType,
	CustomCommandRegistry,
	CustomCommandResult,
	CustomCommandStatus,
	Entity,
	ItemType,
	Player,
	PlayerPermissionLevel,
	StartupBeforeEventSignal,
	system,
	SystemBeforeEvents,
	Vector3,
	world,
} from "@minecraft/server";
import '../prototypes';
import { CustomCommandParamsMapping } from "../prototypes";

function isAsync(fn: Function): boolean {
	return fn.constructor.name === "AsyncFunction";
}

interface MyCommandParameter extends CustomCommandParameter {
	readonly enumValues?: readonly string[];
}

export interface MyCustomCommand extends Omit<CustomCommand, 'mandatoryParameters' | 'optionalParameters'> {
	readonly mandatoryParameters?: readonly MyCommandParameter[];
	readonly optionalParameters?: readonly MyCommandParameter[];
}

export type ExtractParamTypesEnum<T extends readonly { type: CustomCommandParamType; }[]> = {
	[K in keyof T]: T[K] extends { type: CustomCommandParamType.Enum; enumValues: readonly (infer U)[]; }
	? U
	: T[K]['type'] extends keyof CustomCommandParamsMapping
	? CustomCommandParamsMapping[T[K]['type']]
	: never;
};

export type ExtractParamTypesOptionalEnum<T extends readonly { type: CustomCommandParamType; }[]> = {
	[K in keyof T]: T[K] extends { type: CustomCommandParamType.Enum; enumValues: readonly (infer U)[]; }
	? U | undefined
	: T[K]['type'] extends keyof CustomCommandParamsMapping
	? CustomCommandParamsMapping[T[K]['type']] | undefined
	: never;
};

export class Command {
	static enums: Record<string, string[]> = {};
	static commands: [CustomCommand, Function][] = [];
	static beforeRegistrationEvents: (() => void)[] = [];


	/**
	 * wraps StartupBeforeEvent.customCommandRegistry.registerCommand with enum value registration 
	 * within the command registration and the callbacks typed in order to the params listed, mandatory comes before optional of course.
	 * @param args 
	 * @param cb 
	 * ```js
	 * // 'a' typed as: Entity[]
	 * // 'b' typed as: "test" | "value2"
	 * // 'c' typed as: string | undefined
	 * // 'd' type as: "vale1" | "vale2" | "value2" | "22" | undefined
	 * Command.registerCommand({
	 * 	name: "test",
	 * 	description: "test",
	 * 	permissionLevel: CommandPermissionLevel.Admin,
	 * 	mandatoryParameters: [{ name: "test", type: CustomCommandParamType.EntitySelector }, { name: "test", type: CustomCommandParamType.Enum, enumValues: ["test", "value2"] }] as const, // as const very important,
	 * 	optionalParameters: [{ name: "test", type: CustomCommandParamType.String }, { name: "test", type: CustomCommandParamType.Enum, enumValues: ["vale1", "vale2", "value2", "22"] }] as const
	 * 
	 * }, (origin, a, b, c, d) => {
	 * 	// console.warn(a); // Optional: Read 'a' to clear the unused variable warning
	 * });
	 * ```
	 */
	static registerCommand<
		const M extends readonly MyCommandParameter[] = [],
		const O extends readonly MyCommandParameter[] = []
	>(
		args: { mandatoryParameters?: M; optionalParameters?: O; } & MyCustomCommand,
		cb: (
			origin: CustomCommandOrigin,
			...data: [...ExtractParamTypesEnum<M>, ...ExtractParamTypesOptionalEnum<O>]
		) => CustomCommandResult | undefined | void | Promise<void>,
	): void {
		const newArgs = args as unknown as CustomCommand;
		newArgs.mandatoryParameters = args.mandatoryParameters?.map(param => {
			const { name, type, enumValues } = param;
			if (enumValues) Command.enums[name] = [...enumValues];
			return { name, type };
		});
		newArgs.optionalParameters = args.optionalParameters?.map(param => {
			const { name, type, enumValues } = param;
			if (enumValues) Command.enums[name] = [...enumValues];
			return { name, type };
		});
		Command.commands.push([newArgs, cb]);
	}

	static subscribeBeforeRegistration(callback: () => void) {
		Command.beforeRegistrationEvents.push(callback);
	}
}

system.beforeEvents.startup.subscribe((event) => {
	Command.beforeRegistrationEvents.forEach(callback => {
		callback?.();
	});
	Object.entries(Command.enums).forEach(([name, enumArray]) => {
		event.customCommandRegistry.registerEnum(name, enumArray);
	});
	Command.commands.forEach(([newArgs, cb]) => {
		event.customCommandRegistry.registerCommand(newArgs, ((...result) => {
			const callback = (cb as any);
			if (isAsync(callback)) {
				callback(...result);
				return { status: CustomCommandStatus.Success };
			}
			return callback?.(...result);
		}));
	});
	Command.commands = [];
	Command.enums = {};
});
/*
// 'a' typed as: Entity[]
// 'b' typed as: "test" | "value2"
// 'c' typed as: string | undefined
// 'd' type as: "vale1" | "vale2" | "value2" | "22" | undefined
Command.registerCommand({
	name: "test",
	description: "test",
	permissionLevel: CommandPermissionLevel.Admin,
	mandatoryParameters: [{ name: "test", type: CustomCommandParamType.EntitySelector }, { name: "test", type: CustomCommandParamType.Enum, enumValues: ["test", "value2"] }] as const, // as const very important,
	optionalParameters: [{ name: "test", type: CustomCommandParamType.String }, { name: "test", type: CustomCommandParamType.Enum, enumValues: ["vale1", "vale2", "value2", "22"] }] as const

}, (origin, a, b, c, d) => {
	// console.warn(a); // Optional: Read 'a' to clear the unused variable warning
});
*/

Command.registerCommand({
	name: "test",
	description: "test",
	permissionLevel: CommandPermissionLevel.Admin,
}, (origin) => {
	// console.warn(a); // Optional: Read 'a' to clear the unused variable warning
});