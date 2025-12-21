/**
 * All possible MinecraftPotionModifierTypes
 */
export const enum MinecraftPotionModifierTypes {
    Long = "Long",
    Normal = "Normal",
    Strong = "Strong"
}
/**
 * Union type equivalent of the MinecraftPotionModifierTypes enum.
 */
export type MinecraftPotionModifierTypesUnion = keyof typeof MinecraftPotionModifierTypes;
