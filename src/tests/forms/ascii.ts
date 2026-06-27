import { CustomForm, ObservableString } from "@minecraft/server-ui";

import { PACK_PREFIX } from "../../pack_prefix";
import { CommandPermissionLevel, Player, system } from "@minecraft/server";
import { Command } from "../../patchy-stable-api/libraries/command";

function createAndShowForm(player: Player) {
	const title = new ObservableString(" ", { clientWritable: true });
	const label = new ObservableString(
		`§f█§f█§f█§m█§m█§m█§m█§m█§f█§f█§f█§f█
§f█§f█§m█§m█§m█§m█§m█§m█§m█§m█§m█§f█
§f█§f█§8█§8█§8█§p█§p█§8█§p█§f█§f█§f█
§f█§8█§p█§8█§p█§p█§p█§8█§p█§p█§p█§f█
§f█§8█§p█§8█§8█§p█§p█§p█§8█§p█§p█§p█
§f█§8█§8█§p█§p█§p█§p█§8█§8█§8█§8█§f█
§f█§f█§f█§p█§p█§p█§p█§p█§p█§p█§f█§f█
§f█§f█§8█§8█§m█§8█§8█§8█§f█§f█§f█§f█
§f█§8█§8█§8█§m█§8█§8█§m█§8█§8█§8█§f█
§8█§8█§8█§8█§m█§m█§m█§m█§8█§8█§8█§8█
§p█§p█§8█§m█§p█§m█§m█§p█§m█§8█§p█§p█
§p█§p█§p█§m█§m█§m█§m█§m█§m█§p█§p█§p█
§p█§p█§m█§m█§m█§m█§m█§m█§m█§m█§p█§p█
§f█§f█§m█§m█§m█§f█§f█§m█§m█§m█§f█§f█
§f█§8█§8█§8█§f█§f█§f█§f█§8█§8█§8█§f█
§8█§8█§8█§8█§f█§f█§f█§f█§8█§8█§8█§8█`, { clientWritable: true });
	const form = new CustomForm(player, title);
	form.label(label, { visible: true });
	form.textField("Enter form Title", title, { visible: true, disabled: false });
	form.textField("Enter form Label", label, { visible: true, disabled: false });
	form.show();
}

Command.registerCommand({ name: `${PACK_PREFIX}custom_form`, description: "", permissionLevel: CommandPermissionLevel.Admin },
	async (origin) => {
		const { sourceEntity: player } = origin;
		if (!(player instanceof Player)) return;
		await system.waitTicks(0);
		createAndShowForm(player);
	});