import { CommandPermissionLevel, CustomCommandParamType, Entity, Player, system, world, World } from "@minecraft/server";
import { COMMAND_PREFIX } from "../../command_prefix.js";
import { Command } from "../libraries/command";
import { ActionForm, ModalForm } from "../libraries/form";
import { DynamicPropertyTypes, storage } from "../libraries/properties";
import { isVector3 } from "../libraries/utilities";
function getViewPropertyValueForm(player, target = world, targetStorage = target instanceof World ? storage.get(target) : storage.get(target), dynamicPropertyId) {
    if (!target || (target instanceof Entity && !target.isValid))
        return;
    const form = new ActionForm().title(`Edit ${dynamicPropertyId}`);
    const value = target.getDynamicProperty(dynamicPropertyId);
    const cachedType = targetStorage.getCachedType("dynamicPropertyId") ?? "NotCached";
    form.label(`${dynamicPropertyId}: 
value: ${(isVector3(value) || cachedType === DynamicPropertyTypes.JSON) ? JSON.stringify(value) : value}
cachedType: ${cachedType}
cachedValue: ${(isVector3(value) || cachedType === DynamicPropertyTypes.JSON) ? JSON.stringify(value) : targetStorage.getCachedValue(dynamicPropertyId)}`);
    form.button("back").callback(() => {
        getPropertyEditForm(player, target, targetStorage, dynamicPropertyId)?.show(player);
    });
    form.closeCallback(() => {
        getPropertyEditViewMenuForm(player, target, targetStorage, dynamicPropertyId)?.show(player);
    });
    return form;
}
function getPropertyEditForm(player, target = world, targetStorage = target instanceof World ? storage.get(target) : storage.get(target), dynamicPropertyId) {
    if (!target || (target instanceof Entity && !target.isValid))
        return;
    const form = new ModalForm().title(`Edit ${dynamicPropertyId}`);
    const value = target.getDynamicProperty(dynamicPropertyId);
    const cachedType = targetStorage.getCachedType("dynamicPropertyId") ?? "NotCached";
    form.label(`${dynamicPropertyId}: 
value: ${cachedType === DynamicPropertyTypes.JSON ? "View in View" : isVector3(value) ? JSON.stringify(value) : value}
cachedType: ${cachedType}
cachedValue: ${cachedType === DynamicPropertyTypes.JSON ? "View in View" : targetStorage.getCachedValue(dynamicPropertyId)}`);
    form.closeCallback(() => {
        getPropertyEditViewMenuForm(player, target, targetStorage, dynamicPropertyId)?.show(player);
    });
    form.textField("Enter Value:", "").callback((player, newValue) => {
        if (newValue === "") {
            switch (cachedType) {
                case DynamicPropertyTypes.Boolean: {
                    targetStorage.removeBoolean(dynamicPropertyId);
                }
                case DynamicPropertyTypes.JSON: {
                    targetStorage.removeJSON(dynamicPropertyId);
                }
                case DynamicPropertyTypes.Number: {
                    targetStorage.removeNumber(dynamicPropertyId);
                }
                case DynamicPropertyTypes.Vector3: {
                    targetStorage.removeVector3(dynamicPropertyId);
                }
                case DynamicPropertyTypes.String: {
                    targetStorage.removeString(dynamicPropertyId);
                }
            }
        }
        const numberValue = Number(value);
        if (Number.isFinite(numberValue)) {
            return targetStorage.setNumber(dynamicPropertyId, numberValue);
        }
        let jsonValue;
        try {
            jsonValue = JSON.parse(newValue);
        }
        catch { }
        if (jsonValue && isVector3(jsonValue)) {
            return targetStorage.setVector3(dynamicPropertyId, jsonValue);
        }
        if (jsonValue && jsonValue instanceof Object) {
            return targetStorage.setJSON(jsonValue);
        }
        targetStorage.setString(jsonValue);
    });
    return form;
}
function getPropertyEditViewMenuForm(player, target = world, targetStorage = target instanceof World ? storage.get(target) : storage.get(target), dynamicPropertyId) {
    if (!target || (target instanceof Entity && !target.isValid))
        return;
    const form = new ActionForm().title(`Edit or View Menu ${dynamicPropertyId}`);
    const value = target.getDynamicProperty(dynamicPropertyId);
    const cachedType = targetStorage.getCachedType("dynamicPropertyId") ?? "NotCached";
    form.label(`${dynamicPropertyId}: 
value: ${cachedType === DynamicPropertyTypes.JSON ? "View in View" : isVector3(value) ? JSON.stringify(value) : value}
cachedType: ${cachedType}
cachedValue: ${cachedType === DynamicPropertyTypes.JSON ? "View in View" : targetStorage.getCachedValue(dynamicPropertyId)}`);
    form.button("Edit").callback(() => {
        getPropertyEditForm(player, target, targetStorage, dynamicPropertyId)?.show(player);
    });
    form.button("View").callback(() => {
        getViewPropertyValueForm(player, target, targetStorage, dynamicPropertyId)?.show(player);
    });
    return form;
}
function getPropertiesForm(player, target = world) {
    if (!target || (target instanceof Entity && !target.isValid))
        return;
    const form = new ActionForm().title("properties");
    const targetStorage = target instanceof World ? storage.get(target) : storage.get(target);
    target.getDynamicPropertyIds().forEach((dynamicPropertyId) => {
        const value = target.getDynamicProperty(dynamicPropertyId);
        const cachedType = targetStorage.getCachedType("dynamicPropertyId") ?? "NotCached";
        form.label(`${dynamicPropertyId}: 
value: ${cachedType === DynamicPropertyTypes.JSON ? "View in EDIT" : isVector3(value) ? JSON.stringify(value) : value}
cachedType: ${cachedType}
cachedValue: ${cachedType === DynamicPropertyTypes.JSON ? "View in EDIT" : targetStorage.getCachedValue(dynamicPropertyId)}`);
        form.button("edit").callback(() => {
            getPropertyEditViewMenuForm(player, target, targetStorage, dynamicPropertyId)?.show(player);
        });
    });
    return form;
}
Command.registerCommand({
    name: `${COMMAND_PREFIX}properties`,
    description: "Manages dynamic properties via UI",
    permissionLevel: CommandPermissionLevel.Admin,
    optionalParameters: [{ type: CustomCommandParamType.EntitySelector, name: "target" }]
}, async ({ sourceEntity: player }, entity) => {
    if (!(player instanceof Player))
        return;
    await system.waitTicks(0);
    getPropertiesForm(player, entity?.[0])?.showAwaitNotBusy(player);
});
