import { world } from "@minecraft/server";
import { ActionForm } from "libraries/form";


world.afterEvents.itemUse.subscribe((event) => {
	const { source } = event;
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
});