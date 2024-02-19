import { ActionFormData, FormCancelationReason, MessageFormData } from '@minecraft/server-ui';
class ActionFormWithoutCallback {
    constructor() {
        this.callbacks = [];
        this.root = new ActionFormData();
        this.lastCallCallbackable = false;
    }
    /**
     * Add a button to the form (callbackable)
     */
    button(...args: Parameters<ActionFormData['button']>): this {
        this.root.button(...args);
        this.lastCallCallbackable = true;
        this.callbacks.push(undefined);
        return this;
    }
    /**
     * Show the form to a player and runs a callback if available depending what action or state the player is in or inputed (cannot call callback after this method is called)
     */
    async show(receiver) {
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
    /**
     * Set the title of the form (cannot call callback after this method is called)
     */
    title(title) {
        this.lastCallCallbackable = false;
        this.root.title(title);
        return this;
    }
    /**
     * Sets the body of the form (cannot call callback after this method is called)
     */
    body(text) {
        this.lastCallCallbackable = false;
        this.root.body(text);
        return this;
    }
    /**
     * callback to run when the form is closed (cannot call callback after this method is called)
     */
    closeCallback(callback) {
        this.lastCallCallbackable = false;
        this._closeCallback = callback;
        return this;
    }
    /**
     * callback to run when the player is busy ie in a menu (cannot call callback after this method is called)
     */
    busyCallback(callback) {
        this.lastCallCallbackable = false;
        this._busyCallback = callback;
        return this;
    }
}
;
export class ActionForm extends ActionFormWithoutCallback {
    constructor() {
        super();
    }
    /**
     * assigns a callback to the last callbackable method called (cannot call callback after this method is called)
     */
    callback(callback) {
        if (!this.lastCallCallbackable)
            throw new Error('Cannot add callback after non-callbackable method');
        this.callbacks[this.callbacks.length - 1] = callback;
        this.lastCallCallbackable = false;
        return this;
    }
}
class MessageFormWithoutCallback {
    constructor() {
        this.callbacks = [undefined, undefined];
        this.root = new MessageFormData();
        this.lastCallCallbackable = false;
    }
    /**
     * Add a button to the form (callbackable)
     */
    button1(text) {
        this.root.button1(text);
    }
}
//# sourceMappingURL=form.js.map