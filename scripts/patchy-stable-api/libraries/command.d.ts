import { CustomCommand, CustomCommandOrigin, CustomCommandParameter, CustomCommandParamType, CustomCommandResult } from "@minecraft/server";
import '../prototypes';
import { CustomCommandParamsMapping } from "../prototypes";
interface MyCommandParameter extends CustomCommandParameter {
    readonly enumValues?: string[];
}
export interface MyCustomCommand extends CustomCommand {
    readonly mandatoryParameters?: MyCommandParameter[];
    readonly optionalParameters?: MyCommandParameter[];
}
type EnumValues<T> = T extends {
    type: CustomCommandParamType.Enum;
    enumValues: readonly (infer U)[];
} ? U : never;
export type ExtractParamTypesEnum<T extends {
    type: CustomCommandParamType;
}[]> = {
    [K in keyof T]: T[K] extends {
        type: CustomCommandParamType.Enum;
        enumValues: readonly string[];
    } ? EnumValues<T[K]> : T[K] extends {
        type: infer P;
    } ? P extends CustomCommandParamType ? CustomCommandParamsMapping[P] : never : never;
} extends infer U ? U extends any[] ? U : never : never;
export type ExtractParamTypesOptionalEnum<T extends {
    type: CustomCommandParamType;
}[]> = {
    [K in keyof T]: T[K] extends {
        type: CustomCommandParamType.Enum;
        enumValues: readonly string[];
    } ? EnumValues<T[K]> : T[K] extends {
        type: infer P;
    } ? P extends CustomCommandParamType ? CustomCommandParamsMapping[P] | undefined : never : never;
} extends infer U ? U extends any[] ? U : never : never;
export declare class Command {
    static enums: Record<string, string[]>;
    static commands: [CustomCommand, Function][];
    /**
     * Registers a custom command with the given parameters and callback function.
     * Make sure to as const the parameters to ensure type safety and proper inference of types.
     */
    static registerCommand<M extends MyCommandParameter[], O extends MyCommandParameter[]>(args: {
        mandatoryParameters?: M;
        optionalParameters?: O;
    } & MyCustomCommand, cb: (origin: CustomCommandOrigin, ...data: [...ExtractParamTypesEnum<M>, ...ExtractParamTypesOptionalEnum<O>]) => CustomCommandResult | undefined | void | Promise<void>): void;
}
export {};
