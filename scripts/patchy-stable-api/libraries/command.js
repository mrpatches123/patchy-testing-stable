import { Player } from "@minecraft/server";
class CommandBuilder {
    commands = {};
    commandAlises = {};
    scriptMessageCommands = {};
    scriptMessageCommandAlises = {};
    constructor() {
    }
    subscribeScriptMessageEvent() {
        const scriptMessageCallback = (event) => {
            const { id, sourceEntity, message } = event;
            if (!(sourceEntity instanceof Player))
                return;
            let command = this.getScriptMessageCommand(id);
            if (!command)
                command = this.getScriptMessageCommand(this.scriptMessageCommandAlises[id]);
            if (!command)
                return;
        };
    }
    // addCommand(name: string, callback: (receiver: Player) => void): Command {
    // 	throw new Error("Method not implemented.");
    // 	this.commands[name] = new Command(name);
    // 	return this.commands[name];
    // }
    addScriptMessageCommand(id, callback) {
        this.commands[id] = new Command(id);
        return this.commands[id];
    }
    getScriptMessageCommand(name) {
        return this.commands[name];
    }
    // getCommand(name: string): Command {
    // 	throw new Error("Method not implemented.");
    // 	return this.commands[name];
    // }
    addCommandAlias(alias, commandName) {
        this.commandAlises[alias] = commandName;
    }
    addScriptMessageCommandAlias(alias, commandName) {
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
class BaseCommand {
    elseCallbacks = [];
    branches = [];
    constructor() {
    }
}
class Command extends BaseCommand {
    name;
    constructor(name) {
        super();
        this.name = name;
    }
    addSubCommand(shouldBranchCallback, subCommand) {
        this.branches.push({ branch: subCommand, shouldBranchCallback });
        return this;
    }
    ;
    elseCallback(callback) {
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
    addScriptMessageCommandAlias(alias) {
        commandBuilder.addScriptMessageCommandAlias(alias, this.name);
        return this;
    }
    addScriptMessageCommandAliases(aliases) {
        aliases.forEach(alias => {
            this.addScriptMessageCommandAlias(alias);
        });
        return this;
    }
}
class NumberArgumentedCommand extends BaseCommand {
    addSubCommand(shouldBranchCallback, subCommand) {
        this.branches.push({ branch: subCommand, shouldBranchCallback });
        return this;
    }
    elseCallback(callback) {
        this.elseCallbacks.push(callback);
        return this;
    }
    constructor() {
        super();
    }
}
class StringArgumentedCommand extends BaseCommand {
    addSubCommand(shouldBranchCallback, subCommand) {
        this.branches.push({ branch: subCommand, shouldBranchCallback });
        return this;
    }
    elseCallback(callback) {
        this.elseCallbacks.push(callback);
        return this;
    }
    constructor() {
        super();
    }
}
class BooleanArgumentedCommand extends BaseCommand {
    addSubCommand(shouldBranchCallback, subCommand) {
        this.branches.push({ branch: subCommand, shouldBranchCallback });
        return this;
    }
    elseCallback(callback) {
        this.elseCallbacks.push(callback);
        return this;
    }
    constructor() {
        super();
    }
}
class Vector3ArgumentedCommand extends BaseCommand {
    addSubCommand(shouldBranchCallback, subCommand) {
        this.branches.push({ branch: subCommand, shouldBranchCallback });
        return this;
    }
    elseCallback(callback) {
        this.elseCallbacks.push(callback);
        return this;
    }
    constructor() {
        super();
    }
}
class JSONArgumentedCommand extends BaseCommand {
    addSubCommand(shouldBranchCallback, subCommand) {
        this.branches.push({ branch: subCommand, shouldBranchCallback });
        return this;
    }
    elseCallback(callback) {
        this.elseCallbacks.push(callback);
        return this;
    }
    constructor() {
        super();
    }
}
class SelectorArgumentedCommand extends BaseCommand {
    addSubCommand(shouldBranchCallback, subCommand) {
        this.branches.push({ branch: subCommand, shouldBranchCallback });
        return this;
    }
    elseCallback(callback) {
        this.elseCallbacks.push(callback);
        return this;
    }
    constructor() {
        super();
    }
}
class CustomArgumentedCommand extends BaseCommand {
    addSubCommand(shouldBranchCallback, subCommand) {
        this.branches.push({ branch: subCommand, shouldBranchCallback });
        return this;
    }
    elseCallback(callback) {
        this.elseCallbacks.push(callback);
        return this;
    }
    constructor() {
        super();
    }
}
//# sourceMappingURL=command.js.map