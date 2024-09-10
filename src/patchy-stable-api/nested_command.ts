//@ts-nocheck
import { Player } from "@minecraft/server";

type Command = {
	//@ts-ignore
	[key: string | number | ((player: Player) => boolean)]: Command | ((receiver: Player, argument: string) => void);
};

class CommandHandler {
	commands: Record<string, Command>;
	constructor() {
		this.commands = {};
	}
	registerCommand(commandName: string, command: Command) {
		this.commands[commandName] = command;
	}
}
const commandHandler = new CommandHandler();

commandHandler.registerCommand("test", {
	// @ts-ignore
	[(player) => false]: 2
});