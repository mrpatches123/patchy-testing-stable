import { Entity, Player, Vector3 } from "@minecraft/server";
export declare class ArgumentedCommandTypes {
    static get String(): StringArgumentedCommand;
    static get Number(): NumberArgumentedCommand;
    static get Boolean(): BooleanArgumentedCommand;
    static get Vector3(): Vector3ArgumentedCommand;
    static get JSON(): JSONArgumentedCommand;
    static get Selector(): SelectorArgumentedCommand;
    static get Custom(): CustomArgumentedCommand;
}
declare abstract class BaseCommand {
    elseCallbacks: ((receiver: Player, argument: any) => void)[];
    branches: {
        branch: BaseCommand;
        shouldBranchCallback: (receiver: Player, argument: any) => boolean;
    }[];
    abstract addSubCommand(shouldBranchCallback: (receiver: Player, argument: any) => boolean, subCommand: BaseCommand): this;
    abstract elseCallback(callback: (receiver: Player, argument: any) => void): this;
    constructor();
}
declare class NumberArgumentedCommand extends BaseCommand {
    addSubCommand(shouldBranchCallback: (receiver: Player, argument: number) => boolean, subCommand: BaseCommand): this;
    elseCallback(callback: (receiver: Player, argument: number) => void): this;
    constructor();
}
declare class StringArgumentedCommand extends BaseCommand {
    addSubCommand(shouldBranchCallback: (receiver: Player, argument: string) => boolean, subCommand: BaseCommand): this;
    elseCallback(callback: (receiver: Player, argument: any) => void): this;
    constructor();
}
declare class BooleanArgumentedCommand extends BaseCommand {
    addSubCommand(shouldBranchCallback: (receiver: Player, argument: boolean) => boolean, subCommand: BaseCommand): this;
    elseCallback(callback: (receiver: Player, argument: Vector3) => void): this;
    constructor();
}
declare class Vector3ArgumentedCommand extends BaseCommand {
    addSubCommand(shouldBranchCallback: (receiver: Player, argument: Vector3) => boolean, subCommand: BaseCommand): this;
    elseCallback(callback: (receiver: Player, argument: Vector3) => void): this;
    constructor();
}
declare class JSONArgumentedCommand extends BaseCommand {
    addSubCommand(shouldBranchCallback: (receiver: Player, argument: any) => boolean, subCommand: BaseCommand): this;
    elseCallback(callback: (receiver: Player, argument: any) => void): this;
    constructor();
}
declare class SelectorArgumentedCommand extends BaseCommand {
    addSubCommand(shouldBranchCallback: (receiver: Player, argument: Entity | Player) => boolean, subCommand: BaseCommand): this;
    elseCallback(callback: (receiver: Player, argument: Entity | Player) => void): this;
    constructor();
}
declare class CustomArgumentedCommand extends BaseCommand {
    addSubCommand(shouldBranchCallback: (receiver: Player, argument: string) => boolean, subCommand: BaseCommand): this;
    elseCallback(callback: (receiver: Player, argument: string) => void): this;
    constructor();
}
export {};
