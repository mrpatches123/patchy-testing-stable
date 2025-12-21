import { world } from "@minecraft/server";
import { ActionForm, ModalForm } from "patchy-stable-api/libraries/form";
import { storage } from "patchy-stable-api/libraries/properties";
import { overworld } from "patchy-stable-api/libraries/utilities";
const worldStrorage = storage.get();
export const gameruleKeys = [];
const objectPrototype = Object.getPrototypeOf({});
for (const key in world.gameRules) {
    if (key in objectPrototype)
        continue;
    gameruleKeys.push(key);
}
export function getGameRulesForm(player, errorText) {
    const form = new ActionForm();
    form.title("Game Rules");
    form.body(`\n\n${errorText}`);
    form.button("diffculty: unknown").callback(async () => {
        await updateDiffculty(player).show(player);
    });
    gameruleKeys.forEach((gamerule) => {
        const value = world.gameRules[gamerule];
        form.button(`${gamerule}: ${value}`)
            .callback(async () => {
            if (typeof value === "boolean") {
                const { gamerules = {} } = worldStrorage.jsons;
                gamerules[gamerule] = !value;
                worldStrorage.jsons.gamerules = gamerules;
                world.gameRules[gamerule] = !value;
                await getGameRulesForm(player).show(player);
            }
            else {
                await updateGameRulesForm(player, gamerule).show(player);
            }
        });
    });
    return form;
}
function updateGameRulesForm(player, gamerule, errorText) {
    const value = world.gameRules[gamerule];
    return new ModalForm().textField(`${errorText}\n\n${gamerule}: ${value}`, "Enter the new value").callback(async (player, value) => {
        try {
            const valueConverted = typeof world.gameRules[gamerule] === "boolean" ? Boolean(value) : typeof world.gameRules[gamerule] ? Number(value) : value;
            const { gamerules = {} } = worldStrorage.jsons;
            gamerules[gamerule] = valueConverted;
            worldStrorage.jsons.gamerules = gamerules;
            world.gameRules[gamerule] = valueConverted;
            await getGameRulesForm(player).show(player);
        }
        catch (e) {
            await updateGameRulesForm(player, e.message).show(player);
        }
    }).closeCallback(async () => {
        await getGameRulesForm(player).show(player);
    });
    ;
}
function updateDiffculty(player) {
    const form = new ModalForm();
    form.title("Diffculty");
    const diffculties = ["peaceful", "easy", "normal", "hard"];
    form.dropdown("Select the new diffculty", diffculties).callback(async (player, selection) => {
        try {
            const valueConverted = diffculties[selection];
            overworld.runCommand(`difficulty ${valueConverted}`);
            const { gamerules = {} } = worldStrorage.jsons;
            gamerules.difficulty = valueConverted;
            worldStrorage.jsons.gamerules = gamerules;
            await getGameRulesForm(player).show(player);
        }
        catch (e) {
            await updateDiffculty(player).show(player);
        }
    }).closeCallback(async () => {
        await getGameRulesForm(player).show(player);
    });
    return form;
}
