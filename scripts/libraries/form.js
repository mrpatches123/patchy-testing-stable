import { ActionFormData, FormCancelationReason, MessageFormData, ModalFormData } from '@minecraft/server-ui';
// This class is a base class for All form implementations
class Form {
    constructor() {
        this.lastCallCallbackable = false;
    }
    /**
     * Sets the callback for when the form is closed (cannot call callback after this method is called)
     */
    closeCallback(callback) {
        this.lastCallCallbackable = false;
        this._closeCallback = callback;
        return this;
    }
    /**
     * Sets the callback for when the user is busy (cannot call callback after this method is called)
     */
    busyCallback(callback) {
        this.lastCallCallbackable = false;
        this._busyCallback = callback;
        return this;
    }
}
// This class is a base class for ActionForm and MessageForm
class ButtonForm extends Form {
    constructor() {
        super();
        this.callbacks = [];
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
}
/**
 * This class basically controls when callback can be called for callbackable elements
 */
class ActionFormWithoutCallback extends ButtonForm {
    constructor() {
        super();
        this.callbacks = [];
        this.root = new ActionFormData();
        this.lastCallCallbackable = false;
    }
    /**
     * Add a button to the form (callbackable)
     */
    button(...args) {
        this.root.button(...args);
        this.lastCallCallbackable = true;
        this.callbacks.push(undefined);
        return this;
    }
    /**
     * Set the title of the form (cannot call callback after this method is called)
     */
    title(...args) {
        this.lastCallCallbackable = false;
        this.root.title(...args);
        return this;
    }
    /**
     * Sets the body of the form (cannot call callback after this method is called)
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
    constructor() {
        super();
        this.callbacks = [undefined, undefined];
        this.root = new MessageFormData();
        this.lastCallCallbackable = -1;
    }
    /**
     * Set the title of the form (cannot call callback after this method is called)
     */
    title(...args) {
        this.lastCallCallbackable = -1;
        this.root.title(...args);
        return this;
    }
    /**
     * Sets the body of the form (cannot call callback after this method is called)
     */
    body(...args) {
        this.lastCallCallbackable = -1;
        this.root.body(...args);
        return this;
    }
    /**
     * Set button1 on the form (callbackable)
     */
    button1(...args) {
        this.root.button1(...args);
        this.lastCallCallbackable = 0;
        return this;
    }
    /**
     * Set button2 on the form (callbackable)
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
var LastCallCallbackable;
(function (LastCallCallbackable) {
    LastCallCallbackable[LastCallCallbackable["none"] = -1] = "none";
    LastCallCallbackable[LastCallCallbackable["dropdown"] = 0] = "dropdown";
    LastCallCallbackable[LastCallCallbackable["slider"] = 1] = "slider";
    LastCallCallbackable[LastCallCallbackable["textFeild"] = 2] = "textFeild";
    LastCallCallbackable[LastCallCallbackable["toggle"] = 3] = "toggle";
})(LastCallCallbackable || (LastCallCallbackable = {}));
class ModalFormWithoutCallback extends Form {
    constructor() {
        super();
        this.root = new ModalFormData();
        this.callbacks = [];
        this.lastCallCallbackable = LastCallCallbackable.none;
    }
    /**
     * Set the title of the form (cannot call callback after this method is called)
     */
    title(...args) {
        this.lastCallCallbackable = LastCallCallbackable.none;
        this.root.title(...args);
        return this;
    }
    dropdown(...args) {
        this.lastCallCallbackable = LastCallCallbackable.dropdown;
        this.root.dropdown(...args);
        this.callbacks.push(undefined);
        return this;
    }
    slider(...args) {
        this.lastCallCallbackable = LastCallCallbackable.slider;
        this.root.slider(...args);
        this.callbacks.push(undefined);
        return this;
    }
    textField(...args) {
        this.lastCallCallbackable = LastCallCallbackable.textFeild;
        this.root.textField(...args);
        this.callbacks.push(undefined);
        return this;
    }
    toggle(...args) {
        this.lastCallCallbackable = LastCallCallbackable.toggle;
        this.root.toggle(...args);
        this.callbacks.push(undefined);
        return this;
    }
    async show(receiver) {
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
}
export class ModalFormWithCallback extends ModalFormWithoutCallback {
    constructor() {
        super();
    }
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