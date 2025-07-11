/**
 * All possible MinecraftPotionLiquidTypes
 */
export const enum MinecraftPotionLiquidTypes {
    Lingering = "Lingering",
    Regular = "Regular",
    Splash = "Splash"
}
/**
 * Union type equivalent of the MinecraftPotionLiquidTypes enum.
 */
export type MinecraftPotionLiquidTypesUnion = keyof typeof MinecraftPotionLiquidTypes;
