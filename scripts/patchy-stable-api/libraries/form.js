import { system } from '@minecraft/server';
import { ActionFormData, FormCancelationReason, MessageFormData, ModalFormData } from '@minecraft/server-ui';
/**
 * @param {number | undefined} ticks
 * @returns {Promise<undefined>}
 */
async function sleep(ticks) {
    return new Promise((resolve) => system.runTimeout(() => resolve(undefined), ticks));
}
// This class is a base class for All form implementations
class Form {
    /**
     * @type {(receiver: Player) => void | undefined}
     */
    _closeCallback;
    /**
     * @type {(receiver: Player) => void | undefined}
     */
    _busyCallback;
    /**
     * @type {boolean | -1 | 0 | 1 | 2 | 3}
     */
    lastCallCallbackable = false;
    /**
     * Sets the callback for when the user closes the form (cannot call callback after this method is called)
     * @param {(receiver: Player) => void} callback
     * @returns {this}
     */
    closeCallback(callback) {
        this.lastCallCallbackable = false;
        this._closeCallback = callback;
        return this;
    }
    /**
     * Sets the callback for when the user is busy (cannot call callback after this method is called)
     * @param {(receiver: Player) => void} callback
     * @returns {this}
     */
    busyCallback(callback) {
        this.lastCallCallbackable = false;
        this._busyCallback = callback;
        return this;
    }
}
// This class is a base class for ActionForm and MessageForm
class ButtonForm extends Form {
    /**
     * @type {ActionFormData | MessageFormData}
     */
    root;
    /**
     * Sets the title of the form (cannot call callback after this method is called)
     * @type {(((receiver: Player, i: number) => void) | undefined)[]}
     */
    callbacks = [];
    constructor() {
        super();
    }
    /**
     * Show the form to a player and runs a callback if available depending what action or state the player is in or inputed (cannot call callback after this method is called)
     * @param {Player} receiver
     * @returns {Promise<ActionFormResponse | MessageFormResponse>}
     */
    async show(receiver) {
        try {
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
            }
            else {
                this.callbacks[selection]?.(receiver, selection);
            }
            return response;
        }
        catch (error) {
            console.warn(error.stack);
            throw error;
        }
    }
    /**
     * Show the form to a player and runs a callback if available depending what action or state the player is in or inputed (cannot call callback after this method is called)
     * @param {Player} receiver
     * @returns {Promise<ActionFormResponse | MessageFormResponse>}
     */
    async showAwaitNotBusy(receiver) {
        this.lastCallCallbackable = false;
        let response;
        while (true) {
            if (!receiver || !receiver.isValid())
                return;
            response = await this.root.show(receiver);
            if (response.cancelationReason !== FormCancelationReason.UserBusy) {
                break;
            }
            await sleep();
        }
        const { selection = -1, canceled, cancelationReason } = response;
        if (canceled) {
            switch (cancelationReason) {
                case FormCancelationReason.UserClosed:
                    this._closeCallback?.(receiver);
                    break;
            }
        }
        else {
            this.callbacks[selection]?.(receiver, selection);
        }
        return response;
    }
}
/**
 * This class basically controls when callback can be called for callbackable elements
 */
class ActionFormWithoutCallback extends ButtonForm {
    /**
     * @type {(((receiver: Player, i: number) => void) | undefined)[]}
     */
    callbacks = [];
    /**
     * @type {ActionFormData}
     */
    root = new ActionFormData();
    /**
     * @type {boolean}
     */
    lastCallCallbackable = false;
    constructor() {
        super();
    }
    /**
     * Add a button to the form (callbackable)
     * @param {...Parameters<ActionFormData['button']>} args
     * @returns {ActionForm}
     */
    button(...args) {
        this.root.button(...args);
        this.lastCallCallbackable = true;
        this.callbacks.push(undefined);
        return this;
    }
    /**
     * Set the title of the form (cannot call callback after this method is called)
     * @param {...Parameters<ActionFormData['title']>} args
     * @returns {this}
     */
    title(...args) {
        this.lastCallCallbackable = false;
        this.root.title(...args);
        return this;
    }
    /**
     * Sets the body of the form (cannot call callback after this method is called)
     * @param {...Parameters<ActionFormData['body']>} args
     * @returns {this}
     */
    body(...args) {
        this.lastCallCallbackable = false;
        this.root.body(...args);
        return this;
    }
}
;
/**
 * A form that implements ActionFormData with callbacks for buttons, closing, and user busy that can be shown to a player with a title, body, and limitless buttons (callbackable)
 */
export class ActionForm extends ActionFormWithoutCallback {
    constructor() {
        super();
    }
    /**
     * A form that implements MessageFormData with callbacks for buttons, closing, and user busy that can be shown to a player with a title, body, and two buttons (callbackable)
     * @param {(receiver: Player, i: number) => void} callback
     */
    callback(callback) {
        if (!this.lastCallCallbackable)
            throw new Error('Cannot add callback after non-callbackable method');
        this.callbacks[this.callbacks.length - 1] = callback;
        this.lastCallCallbackable = false;
        return this;
    }
    ;
}
/**
 * This class basically controls when callback can be called for callbackable elements
 */
class MessageFormWithoutCallback extends ButtonForm {
    /**
     * @type {[((receiver: Player, i: number) => void) | undefined, ((receiver: Player, i: number) => void) | undefined]}
     */
    callbacks = [undefined, undefined];
    /**
     * @type {MessageFormData}
     */
    root = new MessageFormData();
    /**
     * @type {-1 | 0 | 1}
     */
    lastCallCallbackable = -1;
    constructor() {
        super();
    }
    /**
     * Set the title of the form (cannot call callback after this method is called)
     * @param {...Parameters<MessageFormData['title']>} args
     * @returns {this}
     */
    title(...args) {
        this.lastCallCallbackable = -1;
        this.root.title(...args);
        return this;
    }
    /**
     * Sets the body of the form (cannot call callback after this method is called)
     * @param {...Parameters<MessageFormData['body']>} args
     * @returns {this}
     */
    body(...args) {
        this.lastCallCallbackable = -1;
        this.root.body(...args);
        return this;
    }
    /**
     * Set button1 on the form (callbackable)
     * @param {...Parameters<MessageFormData['button1']>} args
     * @returns {MessageForm}
     */
    button1(...args) {
        this.root.button1(...args);
        this.lastCallCallbackable = 0;
        return this;
    }
    /**
     * Set button2 on the form (callbackable)
     * @param {...Parameters<MessageFormData['button2']>} args
     * @returns {MessageForm}
     */
    button2(...args) {
        this.root.button2(...args);
        this.lastCallCallbackable = 1;
        return this;
    }
}
/**
 * A form that implements MessageFormData with callbacks for buttons, closing, and user busy that can be shown to a player with a title, body, and two buttons (callbackable)
 */
export class MessageForm extends MessageFormWithoutCallback {
    constructor() {
        super();
    }
    /**
     * Add a callback to the last callbackable element method called (cannot call callback after this method is called)
     * @param {(receiver: Player, i: number) => void} callback
     */
    callback(callback) {
        if (this.lastCallCallbackable === -1)
            throw new Error('Cannot add callback after non-callbackable method');
        this.callbacks[this.lastCallCallbackable] = callback;
        this.lastCallCallbackable = -1;
        return this;
    }
    ;
}
/**
 * this is an enum for the last callbackable element method called
 * @enum {number}
 */
var LastCallCallbackable;
(function (LastCallCallbackable) {
    LastCallCallbackable[LastCallCallbackable["none"] = -1] = "none";
    LastCallCallbackable[LastCallCallbackable["dropdown"] = 0] = "dropdown";
    LastCallCallbackable[LastCallCallbackable["slider"] = 1] = "slider";
    LastCallCallbackable[LastCallCallbackable["textFeild"] = 2] = "textFeild";
    LastCallCallbackable[LastCallCallbackable["toggle"] = 3] = "toggle";
})(LastCallCallbackable || (LastCallCallbackable = {}));
/**
 * This class basically controls when callback can be called for callbackable elements
 */
class ModalFormWithoutCallback extends Form {
    /**
     * @type {ModalFormData}
     */
    root = new ModalFormData();
    /**
     * @type {(((receiver: Player, data: string | number | boolean, i: number) => void) | undefined)[]}
     */
    callbacks = [];
    /**
     * @type {LastCallCallbackable}
     */
    lastCallCallbackable = LastCallCallbackable.none;
    constructor() {
        super();
    }
    /**
     * Set the title of the form (cannot call callback after this method is called)
     * @param {...Parameters<ModalFormData['title']>} args
     * @returns {this}
     */
    title(...args) {
        this.lastCallCallbackable = LastCallCallbackable.none;
        this.root.title(...args);
        return this;
    }
    /**
     * Addes a dropdown to the form (callbackable)
     * @param {...Parameters<ModalFormData['dropdown']>} args
     * @returns {ModalFormWithCallback<number>}
     */
    dropdown(...args) {
        this.lastCallCallbackable = LastCallCallbackable.dropdown;
        this.root.dropdown(...args);
        this.callbacks.push(undefined);
        return this;
    }
    /**
     * Addes a slider to the form (callbackable)
     * @param {...Parameters<ModalFormData['slider']>} args
     * @returns {ModalFormWithCallback<number>}
     */
    slider(...args) {
        this.lastCallCallbackable = LastCallCallbackable.slider;
        this.root.slider(...args);
        this.callbacks.push(undefined);
        return this;
    }
    /**
     * Addes a text field to the form (callbackable)
     * @param {...Parameters<ModalFormData['textField']>} args
     * @returns {ModalFormWithCallback<string>}
     */
    textField(...args) {
        this.lastCallCallbackable = LastCallCallbackable.textFeild;
        this.root.textField(...args);
        this.callbacks.push(undefined);
        return this;
    }
    /**
     * Addes a toggle to the form (callbackable)
     * @param {...Parameters<ModalFormData['toggle']>} args
     * @returns {ModalFormWithCallback<boolean>}
     */
    toggle(...args) {
        this.lastCallCallbackable = LastCallCallbackable.toggle;
        this.root.toggle(...args);
        this.callbacks.push(undefined);
        return this;
    }
    /**
     * Show the form to a player and runs a callback if available depending what action or state the player is in or inputed (cannot call callback after this method is called)
     * @param {Player} receiver
     * @returns {Promise<ModalFormResponse>}
     */
    async show(receiver) {
        try {
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
            }
            else {
                this.callbacks.forEach((callback, i) => {
                    callback?.(receiver, formValues[i], i);
                });
            }
            return response;
        }
        catch (error) {
            console.warn(error.stack);
            throw error;
        }
    }
    /**
     * await until the player is not busy then Show the form to a player and runs a callback if available depending what action or state the player is in or inputed (cannot call callback after this method is called)
     * @param {Player} receiver
     * @returns {Promise<ModalFormResponse>}
     */
    async showAwaitNotBusy(receiver) {
        try {
            this.lastCallCallbackable = LastCallCallbackable.none;
            let response;
            while (true) {
                if (!receiver || !receiver.isValid())
                    return;
                response = await this.root.show(receiver);
                if (response.cancelationReason !== FormCancelationReason.UserBusy) {
                    break;
                }
                await sleep();
            }
            const { canceled, cancelationReason, formValues = [] } = response;
            if (canceled) {
                switch (cancelationReason) {
                    case FormCancelationReason.UserClosed:
                        this._closeCallback?.(receiver);
                        break;
                }
            }
            else {
                this.callbacks.forEach((callback, i) => {
                    callback?.(receiver, formValues[i], i);
                });
            }
            return response;
        }
        catch (error) {
            console.warn(error.stack);
            throw error;
        }
    }
}
export class ModalFormWithCallback extends ModalFormWithoutCallback {
    constructor() {
        super();
    }
    /**
     * Add a callback to the last callbackable element method called (cannot call callback after this method is called)
     * @param {(receiver: Player, data: lastCallbackData, i: number) => void} callback
     * @returns {ModalFormWithoutCallback}
     */
    callback(callback) {
        if (this.lastCallCallbackable === LastCallCallbackable.none)
            throw new Error('Cannot add callback after non-callbackable method');
        this.callbacks[this.callbacks.length - 1] = callback;
        this.lastCallCallbackable = LastCallCallbackable.none;
        return this;
    }
    ;
}
export class ModalForm extends ModalFormWithCallback {
    constructor() {
        super();
    }
}
//# sourceMappingURL=form.js.map