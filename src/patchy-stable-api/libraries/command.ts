import { BlockType, CommandPermissionLevel, CommandResult, CustomCommand, CustomCommandOrigin, CustomCommandParameter, CustomCommandParamType, CustomCommandRegistry, CustomCommandResult, CustomCommandStatus, Entity, ItemType, Player, PlayerPermissionLevel, system, Vector3, world, } from "@minecraft/server";
import '../prototypes';
import { CustomCommandParamsMapping } from "../prototypes";

function isAsync(fn: Function): boolean {
	return fn.constructor.name === "AsyncFunction";
}
interface MyCommandParameter extends CustomCommandParameter {
	readonly enumValues?: string[];
}
export interface MyCustomCommand extends CustomCommand {
	readonly mandatoryParameters?: MyCommandParameter[];
	readonly optionalParameters?: MyCommandParameter[];
}
type EnumValues<T> = T extends { type: CustomCommandParamType.Enum; enumValues: readonly (infer U)[]; }
	? U
	: never;
export type ExtractParamTypesEnum<T extends { type: CustomCommandParamType; }[]> = {
	[K in keyof T]:
	T[K] extends { type: CustomCommandParamType.Enum; enumValues: readonly string[]; }
	? EnumValues<T[K]>
	: T[K] extends { type: infer P; }
	? P extends CustomCommandParamType
	? CustomCommandParamsMapping[P]
	: never
	: never;
} extends infer U ? U extends any[] ? U : never : never;
export type ExtractParamTypesOptionalEnum<T extends { type: CustomCommandParamType; }[]> = {
	[K in keyof T]:
	T[K] extends { type: CustomCommandParamType.Enum; enumValues: readonly string[]; }
	? EnumValues<T[K]>
	: T[K] extends { type: infer P; }
	? P extends CustomCommandParamType
	? CustomCommandParamsMapping[P] | undefined
	: never
	: never;
} extends infer U ? U extends any[] ? U : never : never;
export class Command {

	static enums: Record<string, string[]> = {};
	static commands: [CustomCommand, Function][] = [];
	/**
	 * Registers a custom command with the given parameters and callback function.
	 * Make sure to as const the parameters to ensure type safety and proper inference of types.
	 */
	static registerCommand<M extends MyCommandParameter[], O extends MyCommandParameter[]>(
		args: {
			mandatoryParameters?: M;
			optionalParameters?: O;
		} & MyCustomCommand,
		cb: (origin: CustomCommandOrigin, ...data: [...ExtractParamTypesEnum<M>, ...ExtractParamTypesOptionalEnum<O>]) => Promise<void> | CustomCommandResult | undefined,
	): void {
		const newArgs = <CustomCommand>args;
		newArgs.mandatoryParameters = args.mandatoryParameters?.map(param => {
			const { name, type, enumValues } = param;
			if (enumValues) Command.enums[name] = enumValues;
			return { name, type };
		});
		newArgs.optionalParameters = args.optionalParameters?.map(param => {
			const { name, type, enumValues } = param;
			if (enumValues) Command.enums[name] = enumValues;
			return { name, type };
		});
		Command.commands.push([newArgs, cb]);
	}
}
system.beforeEvents.startup.subscribe((event) => {
	Object.entries(Command.enums).forEach(([name, enumArray]) => {
		event.customCommandRegistry.registerEnum(name, enumArray);
	});
	Command.commands.forEach(([newArgs, cb]) => {
		event.customCommandRegistry.registerCommand(newArgs, ((...result) => {
			console.warn({ t: "3938", result });
			const callback = (cb as any);
			if (isAsync(callback)) {
				callback(...result);
				return { status: CustomCommandStatus.Success };
			}
			return callback?.(...result);
		}) as any);
	});

	Command.commands = [];
	Command.enums = {};
});
// Command.registerCommand({
// 	name: "wkdwk",
// 	description: "wwddwdw",
// 	permissionLevel: CommandPermissionLevel.Any,
// 	mandatoryParameters: [
// 		{
// 			type: CustomCommandParamType.Location,
// 			name: "jdkjdw"
// 		},
// 		{
// 			type: CustomCommandParamType.Enum,
// 			name: "test",
// 			enumValues: ["wwddw", "wdklwdk"] as const
// 		}] as const,
// 	optionalParameters: [
// 		{
// 			type: CustomCommandParamType.Enum,
// 			name: "test2",
// 			enumValues: ["wwddw", "wdklwdk"] as const
// 		}] as const,
// }, (...args) => {
// 	return undefined;
// });