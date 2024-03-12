class CommandHandler {

}
enum ArgumentTypes {
	String,
	Number,
	Boolean,
	Vector3,
	JSON,
	Selector,
	Custom
}
class CommandBuilder {
	protected command: Command;
	constructor() {
		this.command = new Command();
	}
}
class Command {
	addArgument(ArgumentType: ArgumentTypes, callback: (receiver: any, value: any) => void) {

	}
}