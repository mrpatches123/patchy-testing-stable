/**
 * All possible MinecraftPotionDeliveryTypes
 */
export declare const enum MinecraftPotionDeliveryTypes {
    Consume = "Consume",
    ThrownLingering = "ThrownLingering",
    ThrownSplash = "ThrownSplash"
}
/**
 * Union type equivalent of the MinecraftPotionDeliveryTypes enum.
 */
export type MinecraftPotionDeliveryTypesUnion = keyof typeof MinecraftPotionDeliveryTypes;
