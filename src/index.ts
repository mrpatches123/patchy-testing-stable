import { EntityInventoryComponent, ItemStack, Player, world } from "@minecraft/server";
import { ActionForm, MessageForm, ModalForm } from "libraries/form";
import { MinecraftItemTypes } from "libraries/vanilla-data";

const itemsFunctions: Record<string, (source: Player) => void> = {
	"action": (source) => {
		const form = new ActionForm();
		form.button("test0")
			.callback(() => {
				console.warn('test0');
			}).button("test1").callback(() => {
				console.warn('test1');
			}).button("nothing").button("test2").callback(() => {
				console.warn('test2');
			}).busyCallback(() => {
				console.warn('busy');
			}).closeCallback(() => {
				console.warn('close');
			}).body('test').title('test').show(source);
	},
	"message": (source) => {
		const form = new MessageForm();
		form.button1("test0")
			.callback(() => console.warn("test0"))
			.button2('test1_nothing')
			.body("test")
			.title('test')
			.closeCallback(() => console.warn("closed"))
			.busyCallback(() => console.warn("busy"))
			.show(source);

	},
	"modal": (source) => {
		const form = new ModalForm();
		form.slider("test0", 0, 10, 1)
			.callback((receiver, number) => console.warn("test0", number))
			.dropdown("test1", ["a", "b", "c"])
			.callback((receiver, number) => console.warn("test1", number))
			.textField("test2_NONE", "default")
			.textField("test3", "default")
			.callback((receiver, text) => console.warn("test3", text))
			.toggle("test4", false)
			.callback((receiver, boolean) => console.warn("test4", boolean))
			.busyCallback(() => console.warn("busy"))
			.closeCallback(() => console.warn("closed"))
			.title('test').show(source);
	}
};
world.afterEvents.itemUse.subscribe((event) => {
	const { source, itemStack } = event;
	switch (itemStack.typeId) {
		case MinecraftItemTypes.Brush: {
			const container = (source.getComponent('minecraft:inventory') as EntityInventoryComponent)!.container!;
			for (let i = 0; i < container.size; i++) {
				const item = container.getItem(i);
				if (!item) continue;
				if (item.typeId === MinecraftItemTypes.Stick) {
					container.setItem(i);
				}
			}
			Object.entries(itemsFunctions).forEach(([key, value]) => {
				const item = new ItemStack(MinecraftItemTypes.Stick, 1);
				item.nameTag = key;
				container.addItem(item);
			});

		}
		case MinecraftItemTypes.Stick: {
			itemsFunctions[itemStack.nameTag ?? ""]?.(source);
		}
	}
});
