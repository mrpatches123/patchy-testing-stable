import { Player } from '@minecraft/server';
import { ActionFormData, FormCancelationReason, MessageFormData, ModalFormData } from '@minecraft/server-ui';
// This class is a base class for All form implementations
class Form {
	protected _closeCallback?: (receiver: Player) => void;
	protected _busyCallback?: (receiver: Player) => void;
	protected lastCallCallbackable: boolean | -1 | 0 | 1 | 2 | 3 = false;
	/**
	 * Sets the callback for when the form is closed (cannot call callback after this method is called)
	 */
	closeCallback(callback: (receiver: Player) => void): this {
		this.lastCallCallbackable = false;
		this._closeCallback = callback;
		return this;
	}
	/**
	 * Sets the callback for when the user is busy (cannot call callback after this method is called)
	 */
	busyCallback(callback: (receiver: Player) => void): this {
		this.lastCallCallbackable = false;
		this._busyCallback = callback;
		return this;
	}
}
// This class is a base class for ActionForm and MessageForm
class ButtonForm extends Form {
	protected root!: ActionFormData | MessageFormData;
	protected callbacks: (((receiver: Player, i: number) => void) | undefined)[] = [];
	constructor() {
		super();
	}
	/**
	 * Show the form to a player and runs a callback if available depending what action or state the player is in or inputed (cannot call callback after this method is called)
	 */
	async show(receiver: Player) {
		this.lastCallCallbackable = false;

		const response = await this.root.show(receiver);
		const { selection = -1, canceled, cancelationReason } = response;
		if (canceled) {
			switch (cancelationReason) {
				case FormCancelationReason.UserBusy:
					this._busyCallback?.(receiver);
					break;
				case FormCancelationReason.UserClosed:
					this._closeCallback?.(receiver);
					break;
			}
		} else {
			this.callbacks[selection]?.(receiver, selection);
		}
		return response;
	}
}
/**
 * This class basically controls when callback can be called for callbackable elements
 */
class ActionFormWithoutCallback extends ButtonForm {
	protected callbacks: (((receiver: Player, i: number) => void) | undefined)[] = [];
	protected root = new ActionFormData();
	protected lastCallCallbackable: boolean = false;
	constructor() {
		super();
	}
	/**
	 * Add a button to the form (callbackable)
	 */
	button(...args: Parameters<ActionFormData['button']>): ActionForm {
		this.root.button(...args);
		this.lastCallCallbackable = true;
		this.callbacks.push(undefined);
		return this as unknown as ActionForm;
	}

	/**
	 * Set the title of the form (cannot call callback after this method is called)
	 */
	title(...args: Parameters<ActionFormData['title']>): this {
		this.lastCallCallbackable = false;
		this.root.title(...args);
		return this;
	}
	/**
	 * Sets the body of the form (cannot call callback after this method is called)
	 */
	body(...args: Parameters<ActionFormData['body']>): this {
		this.lastCallCallbackable = false;
		this.root.body(...args);
		return this;
	}

};
/**
 * A form that implements ActionFormData with callbacks for buttons, closing, and user busy that can be shown to a player with a title, body, and limitless buttons (callbackable)
 */
export class ActionForm extends ActionFormWithoutCallback implements ActionFormData {
	constructor() {
		super();
	}
	/**
 * A form that implements MessageFormData with callbacks for buttons, closing, and user busy that can be shown to a player with a title, body, and two buttons (callbackable)
 */
	callback(callback: (receiver: Player, i: number) => void): ActionFormWithoutCallback {
		if (!this.lastCallCallbackable) throw new Error('Cannot add callback after non-callbackable method');
		this.callbacks[this.callbacks.length - 1] = callback;
		this.lastCallCallbackable = false;
		return this;
	};
}
/**
 * This class basically controls when callback can be called for callbackable elements
 */
class MessageFormWithoutCallback extends ButtonForm {
	protected callbacks: [((receiver: Player, i: number) => void) | undefined, ((receiver: Player, i: number) => void) | undefined] = [undefined, undefined];
	protected root = new MessageFormData();
	protected lastCallCallbackable: -1 | 0 | 1 = -1;
	constructor() {
		super();
	}
	/**
	 * Set the title of the form (cannot call callback after this method is called)
	 */
	title(...args: Parameters<MessageFormData['title']>): this {
		this.lastCallCallbackable = -1;
		this.root.title(...args);
		return this;
	}
	/**
	 * Sets the body of the form (cannot call callback after this method is called)
	 */
	body(...args: Parameters<MessageFormData['body']>): this {
		this.lastCallCallbackable = -1;
		this.root.body(...args);
		return this;
	}
	/**
	 * Set button1 on the form (callbackable)
	 */
	button1(...args: Parameters<MessageFormData['button1']>): MessageForm {
		this.root.button1(...args);
		this.lastCallCallbackable = 0;
		return this as unknown as MessageForm;
	}
	/**
	 * Set button2 on the form (callbackable)
	 */
	button2(...args: Parameters<MessageFormData['button2']>): MessageForm {
		this.root.button2(...args);
		this.lastCallCallbackable = 1;
		return this as unknown as MessageForm;
	}
}
/**
 * A form that implements MessageFormData with callbacks for buttons, closing, and user busy that can be shown to a player with a title, body, and two buttons (callbackable)
 */
export class MessageForm extends MessageFormWithoutCallback implements MessageFormData {
	constructor() {
		super();
	}
	/**
	 * Add a callback to the last callbackable element method called (cannot call callback after this method is called)
	 */
	callback(callback: (receiver: Player, i: number) => void): MessageFormWithoutCallback {
		if (this.lastCallCallbackable === -1) throw new Error('Cannot add callback after non-callbackable method');
		this.callbacks[this.lastCallCallbackable] = callback;
		this.lastCallCallbackable = -1;
		return this;
	};
}
/**
 * this is an enum for the last callbackable element method called
 */
enum LastCallCallbackable {
	none = -1,
	dropdown = 0,
	slider = 1,
	textFeild = 2,
	toggle = 3
}
/**
 * This class basically controls when callback can be called for callbackable elements
 */
class ModalFormWithoutCallback extends Form {
	protected root = new ModalFormData();
	protected callbacks: (((receiver: Player, data: string | number | boolean, i: number) => void) | undefined)[] = [];
	protected lastCallCallbackable = LastCallCallbackable.none;
	constructor() {
		super();
	}
	/**
	 * Set the title of the form (cannot call callback after this method is called)
	 */
	title(...args: Parameters<ModalFormData['title']>): this {
		this.lastCallCallbackable = LastCallCallbackable.none;
		this.root.title(...args);
		return this;
	}
	/**
	 * Addes a dropdown to the form (callbackable) 
	 */
	dropdown(...args: Parameters<ModalFormData['dropdown']>): ModalFormWithCallback<number> {
		this.lastCallCallbackable = LastCallCallbackable.dropdown;
		this.root.dropdown(...args);
		this.callbacks.push(undefined);
		return this as unknown as ModalFormWithCallback<number>;
	}
	/**
	 * Addes a slider to the form (callbackable) 
	 */
	slider(...args: Parameters<ModalFormData['slider']>): ModalFormWithCallback<number> {
		this.lastCallCallbackable = LastCallCallbackable.slider;
		this.root.slider(...args);
		this.callbacks.push(undefined);
		return this as unknown as ModalFormWithCallback<number>;
	}
	/**
	 * Addes a text field to the form (callbackable) 
	 */
	textField(...args: Parameters<ModalFormData['textField']>): ModalFormWithCallback<string> {
		this.lastCallCallbackable = LastCallCallbackable.textFeild;
		this.root.textField(...args);
		this.callbacks.push(undefined);
		return this as unknown as ModalFormWithCallback<string>;
	}
	/**
	 * Addes a toggle to the form (callbackable) 
	 */
	toggle(...args: Parameters<ModalFormData['toggle']>): ModalFormWithCallback<boolean> {
		this.lastCallCallbackable = LastCallCallbackable.toggle;
		this.root.toggle(...args);
		this.callbacks.push(undefined);
		return this as unknown as ModalFormWithCallback<boolean>;
	}
	/**
	 * Show the form to a player and runs a callback if available depending what action or state the player is in or inputed (cannot call callback after this method is called)
	 */
	async show(receiver: Player) {
		this.lastCallCallbackable = LastCallCallbackable.none;
		const response = await this.root.show(receiver);
		const { canceled, cancelationReason, formValues = [] } = response;
		if (canceled) {
			switch (cancelationReason) {
				case FormCancelationReason.UserBusy:
					this._busyCallback?.(receiver);
					break;
				case FormCancelationReason.UserClosed:
					this._closeCallback?.(receiver);
					break;
			}
		} else {
			this.callbacks.forEach((callback, i) => {
				callback?.(receiver, formValues[i], i);
			});
		}
		return response;
	}

}
export class ModalFormWithCallback<lastCallbackData extends string | number | boolean> extends ModalFormWithoutCallback {
	constructor() {
		super();
	}
	/**
	 * Add a callback to the last callbackable element method called (cannot call callback after this method is called)
	 */
	callback(callback: (receiver: Player, data: lastCallbackData, i: number) => void): ModalFormWithoutCallback {
		if (this.lastCallCallbackable === LastCallCallbackable.none) throw new Error('Cannot add callback after non-callbackable method');
		this.callbacks[this.callbacks.length - 1] = callback as any;
		this.lastCallCallbackable = LastCallCallbackable.none;
		return this;
	};

}
export class ModalForm extends ModalFormWithCallback<string | number | boolean> implements ModalFormData {
	constructor() {
		super();
	}
}