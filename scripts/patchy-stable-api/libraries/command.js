import { CustomCommandStatus, system, } from "@minecraft/server";
import '../prototypes';
function isAsync(fn) {
    return fn.constructor.name === "AsyncFunction";
}
export class Command {
    static enums = {};
    static commands = [];
    /**
     * Registers a custom command with the given parameters and callback function.
     * Make sure to as const the parameters to ensure type safety and proper inference of types.
     */
    static registerCommand(args, cb) {
        const newArgs = args;
        newArgs.mandatoryParameters = args.mandatoryParameters?.map(param => {
            const { name, type, enumValues } = param;
            if (enumValues)
                Command.enums[name] = enumValues;
            return { name, type };
        });
        newArgs.optionalParameters = args.optionalParameters?.map(param => {
            const { name, type, enumValues } = param;
            if (enumValues)
                Command.enums[name] = enumValues;
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
            const callback = cb;
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
