import { Player, world } from "@minecraft/server";
import { ActionForm } from "patchy-stable-api/libraries/form";
export declare const gameruleKeys: (keyof typeof world.gameRules)[];
export declare function getGameRulesForm(player: Player, errorText?: string): ActionForm;
