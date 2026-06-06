import { CommandPermissionLevel, CustomCommandParamType, Entity, Player, system, world, World } from "@minecraft/server";
import { COMMAND_PREFIX } from "../../command_prefix.js";
import { Command } from "../libraries/command";
import { ActionForm, ModalForm } from "../libraries/form";
import { DynamicPropertyTypes, EntityStorageManager, storage, WorldStorageManager } from "../libraries/properties";
import { isDefined, isVector3 } from "../libraries/utilities";
function getViewPropertyValueForm(player: Player, target: Player | Entity | World = world, targetStorage: EntityStorageManager | WorldStorageManager = target instanceof World ? storage.get(target) : storage.get(target), dynamicPropertyId: string) {
	if (!target || (target instanceof Entity && !target.isValid)) return;
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
function getPropertyEditForm(player: Player, target: Player | Entity | World = world, targetStorage: EntityStorageManager | WorldStorageManager = target instanceof World ? storage.get(target) : storage.get(target), dynamicPropertyId: string) {
	if (!target || (target instanceof Entity && !target.isValid)) return;
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
		if (!isDefined(newValue) || newValue === "") {

			switch (cachedType) {
				case DynamicPropertyTypes.Boolean: {
					targetStorage.removeBoolean(dynamicPropertyId);
					break;
				}
				case DynamicPropertyTypes.JSON: {
					targetStorage.removeJSON(dynamicPropertyId);
					break;
				}
				case DynamicPropertyTypes.Number: {
					targetStorage.removeNumber(dynamicPropertyId);
					break;
				}
				case DynamicPropertyTypes.Vector3: {
					targetStorage.removeVector3(dynamicPropertyId);
					break;
				}
				case DynamicPropertyTypes.String: {
					targetStorage.removeString(dynamicPropertyId);
					break;
				}
			}
			return;
		}
		const numberValue = Number(value);
		if (Number.isFinite(numberValue)) {
			return targetStorage.setNumber(dynamicPropertyId, numberValue);
		}
		let jsonValue: any;
		try {
			jsonValue = JSON.parse(newValue);
		} catch { }

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
function getPropertyEditViewMenuForm(player: Player, target: Player | Entity | World = world, targetStorage: EntityStorageManager | WorldStorageManager = target instanceof World ? storage.get(target) : storage.get(target), dynamicPropertyId: string) {
	if (!target || (target instanceof Entity && !target.isValid)) return;
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
function getPropertiesForm(player: Player, target: Player | Entity | World = world) {
	if (!target || (target instanceof Entity && !target.isValid)) return;
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
	if (!(player instanceof Player)) return;
	await system.waitTicks(0);
	getPropertiesForm(player, (entity as ((Entity | undefined)[] | undefined))?.[0])?.showAwaitNotBusy(player);

});