import { Entity, Player, Vector3, system, world } from "@minecraft/server";


class CommandBuilder {
	protected commands: Record<string, Command> = {};
	protected commandAlises: Record<string, string> = {};
	protected scriptMessageCommands: Record<string, (receiver: Player) => void> = {};
	protected scriptMessageCommandAlises: Record<string, string> = {};

	constructor() {

	}
	protected subscribeScriptMessageEvent() {
		const scriptMessageCallback: Parameters<typeof system.afterEvents.scriptEventReceive.subscribe>[0] = (event) => {
			const { id, sourceEntity, message } = event;
			if (!(sourceEntity instanceof Player)) return;
			let command = this.getScriptMessageCommand(id);
			if (!command) command = this.getScriptMessageCommand(this.scriptMessageCommandAlises[id]);
			if (!command) return;

		};
	}
	// addCommand(name: string, callback: (receiver: Player) => void): Command {
	// 	throw new Error("Method not implemented.");
	// 	this.commands[name] = new Command(name);
	// 	return this.commands[name];
	// }
	addScriptMessageCommand(id: string, callback: (receiver: Player) => void): Command {
		this.commands[id] = new Command(id);
		return this.commands[id];
	}
	getScriptMessageCommand(name: string): Command {
		return this.commands[name];
	}
	// getCommand(name: string): Command {
	// 	throw new Error("Method not implemented.");
	// 	return this.commands[name];
	// }
	addCommandAlias(alias: string, commandName: string) {
		this.commandAlises[alias] = commandName;
	}
	addScriptMessageCommandAlias(alias: string, commandName: string) {
		this.scriptMessageCommandAlises[alias] = commandName;
	}
}
const commandBuilder = new CommandBuilder();
// class Command {
// 	addArgument<T extends keyof ArgumentCallbackType>(ArgumentType: T, callback: ArgumentCallbackType[T]) {

// 	}
// }

export class ArgumentedCommandTypes {
	static get String() {
		return new StringArgumentedCommand();
	}
	static get Number() {
		return new NumberArgumentedCommand();
	}
	static get Boolean() {
		return new BooleanArgumentedCommand();
	}
	static get Vector3() {
		return new Vector3ArgumentedCommand();
	}
	static get JSON() {
		return new JSONArgumentedCommand();
	}
	static get Selector() {
		return new SelectorArgumentedCommand();
	}
	static get Custom() {
		return new CustomArgumentedCommand();
	}
}
abstract class BaseCommand {
	elseCallbacks: ((receiver: Player, argument: any) => void)[] = [];
	branches: { branch: BaseCommand, shouldBranchCallback: (receiver: Player, argument: any) => boolean; }[] = [];
	abstract addSubCommand(shouldBranchCallback: (receiver: Player, argument: any) => boolean, subCommand: BaseCommand): this;
	abstract elseCallback(callback: (receiver: Player, argument: any) => void): this;
	constructor() {
	}
}
class Command extends BaseCommand {
	name: string;
	constructor(name: string) {
		super();
		this.name = name;
	}
	addSubCommand(shouldBranchCallback: (receiver: Player, argument: any) => boolean, subCommand: BaseCommand): this {
		this.branches.push({ branch: subCommand, shouldBranchCallback });
		return this;
	};
	elseCallback(callback: (receiver: Player, argument: any) => void): this {
		this.elseCallbacks.push(callback);
		return this;
	}
	// addAlias(alias: string): this {
	// 	commandBuilder.addCommandAlias(alias, this.name);
	// 	return this;
	// }
	// addliases(aliases: string[]): this {
	// 	aliases.forEach(alias => {
	// 		this.addAlias(alias);
	// 	});
	// 	return this;
	// };
	addScriptMessageCommandAlias(alias: string): this {
		commandBuilder.addScriptMessageCommandAlias(alias, this.name);
		return this;
	}
	addScriptMessageCommandAliases(aliases: string[]): this {
		aliases.forEach(alias => {
			this.addScriptMessageCommandAlias(alias);
		});
		return this;
	}
}
class NumberArgumentedCommand extends BaseCommand {
	addSubCommand(shouldBranchCallback: (receiver: Player, argument: number) => boolean, subCommand: BaseCommand): this {
		this.branches.push({ branch: subCommand, shouldBranchCallback });
		return this;
	}
	elseCallback(callback: (receiver: Player, argument: number) => void): this {
		this.elseCallbacks.push(callback);
		return this;

	}
	constructor() {
		super();
	}
}
class StringArgumentedCommand extends BaseCommand {
	addSubCommand(shouldBranchCallback: (receiver: Player, argument: string) => boolean, subCommand: BaseCommand): this {
		this.branches.push({ branch: subCommand, shouldBranchCallback });
		return this;
	}
	elseCallback(callback: (receiver: Player, argument: any) => void): this {
		this.elseCallbacks.push(callback);
		return this;
	}
	constructor() {
		super();
	}
}
class BooleanArgumentedCommand extends BaseCommand {
	addSubCommand(shouldBranchCallback: (receiver: Player, argument: boolean) => boolean, subCommand: BaseCommand): this {
		this.branches.push({ branch: subCommand, shouldBranchCallback });
		return this;
	}
	elseCallback(callback: (receiver: Player, argument: Vector3) => void): this {
		this.elseCallbacks.push(callback);
		return this;
	}
	constructor() {
		super();
	}
}
class Vector3ArgumentedCommand extends BaseCommand {
	addSubCommand(shouldBranchCallback: (receiver: Player, argument: Vector3) => boolean, subCommand: BaseCommand): this {
		this.branches.push({ branch: subCommand, shouldBranchCallback });
		return this;
	}
	elseCallback(callback: (receiver: Player, argument: Vector3) => void): this {
		this.elseCallbacks.push(callback);
		return this;
	}
	constructor() {
		super();
	}
}
class JSONArgumentedCommand extends BaseCommand {
	addSubCommand(shouldBranchCallback: (receiver: Player, argument: any) => boolean, subCommand: BaseCommand): this {
		this.branches.push({ branch: subCommand, shouldBranchCallback });
		return this;
	}
	elseCallback(callback: (receiver: Player, argument: any) => void): this {
		this.elseCallbacks.push(callback);
		return this;
	}
	constructor() {
		super();
	}
}
class SelectorArgumentedCommand extends BaseCommand {
	addSubCommand(shouldBranchCallback: (receiver: Player, argument: Entity | Player) => boolean, subCommand: BaseCommand): this {
		this.branches.push({ branch: subCommand, shouldBranchCallback });
		return this;
	}
	elseCallback(callback: (receiver: Player, argument: Entity | Player) => void): this {
		this.elseCallbacks.push(callback);
		return this;
	}
	constructor() {
		super();
	}
}
class CustomArgumentedCommand extends BaseCommand {
	addSubCommand(shouldBranchCallback: (receiver: Player, argument: string) => boolean, subCommand: BaseCommand): this {
		this.branches.push({ branch: subCommand, shouldBranchCallback });
		return this;
	}
	elseCallback(callback: (receiver: Player, argument: string) => void): this {
		this.elseCallbacks.push(callback);
		return this;
	}
	constructor() {
		super();
	}
}