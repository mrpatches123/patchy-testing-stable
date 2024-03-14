import { EntityInventoryComponent, ItemStack, Player, system, world } from "@minecraft/server";
import { ActionForm, MessageForm, ModalForm } from "patchy-stable-api/libraries/form";
import { MinecraftItemTypes } from "patchy-stable-api/libraries/vanilla-data";
import { storage } from "patchy-stable-api/libraries/properties";

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
world.beforeEvents.playerBreakBlock.subscribe((event) => {
	event.cancel = true;
});
try {
	world.scoreboard.addObjective("test");
} catch (e) {

}
system.afterEvents.scriptEventReceive.subscribe((event) => {
	const { id, message, sourceEntity } = event;
	if (id !== "p:test") return;
	if (!(sourceEntity instanceof Player)) return;
	const worldStorage = storage.get();
	const playerStorage = storage.get(sourceEntity);

	switch (message) {
		case "set": {
			playerStorage.scores.test = 1;

			playerStorage.booleans.test1 = true;
			playerStorage.numbers.test2 = 5;
			playerStorage.vector3s.test3 = { "x": 1, "y": 2, "z": 3 };
			playerStorage.strings.test4 = "dwlwwldwl;wdldw";
			worldStorage.scores.test.cool = 1;
			break;
		}
		case "get": {
			sourceEntity.sendMessage(JSON.stringify({
				score: playerStorage.scores.test ?? "null",
				bool: playerStorage.booleans.test1 ?? "null",
				number: playerStorage.numbers.test2 ?? "null",
				vector: playerStorage.vector3s.test3 ?? "null",
				string: playerStorage.strings.test4 ?? "null",
				worldScore: worldStorage.scores.test.cool ?? "null"
			}, null, 2));
			break;
		}
		case "type": {
			try {
				playerStorage.booleans.test2;
			} catch (e: any) {
				console.warn(e, e.stack);
			}
			try {
				playerStorage.numbers.test1;
			} catch (e: any) {
				console.warn(e, e.stack);
			}
			try {
				playerStorage.strings.test3;
			} catch (e: any) {
				console.warn(e, e.stack);
			}
			try {
				playerStorage.vector3s.test4;
			} catch (e: any) {
				console.warn(e, e.stack);
			}
			break;
		}
		case "clear": {
			playerStorage.clearAll();
			break;
		}
		case "print": {
			sourceEntity.sendMessage(JSON.stringify(playerStorage, null, 4));
			break;
		}
	}
});