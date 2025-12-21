import { Player } from '@minecraft/server';
import { ActionFormData, ActionFormResponse, MessageFormData, MessageFormResponse, ModalFormData, ModalFormResponse } from '@minecraft/server-ui';
declare class Form {
    /**
     * @type {(receiver: Player) => void | undefined}
     */
    protected _closeCallback?: (receiver: Player) => void;
    /**
     * @type {(receiver: Player) => void | undefined}
     */
    protected _busyCallback?: (receiver: Player) => void;
    /**
     * @type {boolean | -1 | 0 | 1 | 2 | 3}
     */
    protected lastCallCallbackable: boolean | -1 | 0 | 1 | 2 | 3;
    /**
     * Sets the callback for when the user closes the form (cannot call callback after this method is called)
     * @param {(receiver: Player) => void} callback
     * @returns {this}
     */
    closeCallback(callback: (receiver: Player) => void): this;
    /**
     * Sets the callback for when the user is busy (cannot call callback after this method is called)
     * @param {(receiver: Player) => void} callback
     * @returns {this}
     */
    busyCallback(callback: (receiver: Player) => void): this;
}
declare class ButtonForm extends Form {
    /**
     * @type {ActionFormData | MessageFormData}
     */
    protected root: ActionFormData | MessageFormData;
    /**
     * Sets the title of the form (cannot call callback after this method is called)
     * @type {(((receiver: Player, i: number) => void) | undefined)[]}
     */
    protected callbacks: (((receiver: Player, i: number) => void) | undefined)[];
    constructor();
    /**
     * Show the form to a player and runs a callback if available depending what action or state the player is in or inputed (cannot call callback after this method is called)
     * @param {Player} receiver
     * @returns {Promise<ActionFormResponse | MessageFormResponse>}
     */
    show(receiver: Player): Promise<ActionFormResponse>;
    /**
     * Show the form to a player and runs a callback if available depending what action or state the player is in or inputed (cannot call callback after this method is called)
     * @param {Player} receiver
     * @returns {Promise<ActionFormResponse | MessageFormResponse>}
     */
    showAwaitNotBusy(receiver: Player): Promise<ActionFormResponse | MessageFormResponse | undefined>;
}
/**
 * This class basically controls when callback can be called for callbackable elements
 */
declare class ActionFormWithoutCallback extends ButtonForm {
    /**
     * @type {(((receiver: Player, i: number) => void) | undefined)[]}
     */
    protected callbacks: (((receiver: Player, i: number) => void) | undefined)[];
    /**
     * @type {ActionFormData}
     */
    protected root: ActionFormData;
    /**
     * @type {boolean}
     */
    protected lastCallCallbackable: boolean;
    constructor();
    /**
     * Add a button to the form (callbackable)
     * @param {...Parameters<ActionFormData['button']>} args
     * @returns {ActionForm}
     */
    button(...args: Parameters<ActionFormData['button']>): ActionForm;
    /**
     * Set the title of the form (cannot call callback after this method is called)
     * @param {...Parameters<ActionFormData['title']>} args
     * @returns {this}
     */
    title(...args: Parameters<ActionFormData['title']>): this;
    /**
     * Sets the body of the form (cannot call callback after this method is called)
     * @param {...Parameters<ActionFormData['body']>} args
     * @returns {this}
     */
    body(...args: Parameters<ActionFormData['body']>): this;
}
/**
 * A form that implements ActionFormData with callbacks for buttons, closing, and user busy that can be shown to a player with a title, body, and limitless buttons (callbackable)
 */
export declare class ActionForm extends ActionFormWithoutCallback implements ActionFormData {
    constructor();
    /**
     * A form that implements MessageFormData with callbacks for buttons, closing, and user busy that can be shown to a player with a title, body, and two buttons (callbackable)
     * @param {(receiver: Player, i: number) => void} callback
     */
    callback(callback: (receiver: Player, i: number) => void): ActionFormWithoutCallback;
}
/**
 * This class basically controls when callback can be called for callbackable elements
 */
declare class MessageFormWithoutCallback extends ButtonForm {
    /**
     * @type {[((receiver: Player, i: number) => void) | undefined, ((receiver: Player, i: number) => void) | undefined]}
     */
    protected callbacks: [((receiver: Player, i: number) => void) | undefined, ((receiver: Player, i: number) => void) | undefined];
    /**
     * @type {MessageFormData}
     */
    protected root: MessageFormData;
    /**
     * @type {-1 | 0 | 1}
     */
    protected lastCallCallbackable: -1 | 0 | 1;
    constructor();
    /**
     * Set the title of the form (cannot call callback after this method is called)
     * @param {...Parameters<MessageFormData['title']>} args
     * @returns {this}
     */
    title(...args: Parameters<MessageFormData['title']>): this;
    /**
     * Sets the body of the form (cannot call callback after this method is called)
     * @param {...Parameters<MessageFormData['body']>} args
     * @returns {this}
     */
    body(...args: Parameters<MessageFormData['body']>): this;
    /**
     * Set button1 on the form (callbackable)
     * @param {...Parameters<MessageFormData['button1']>} args
     * @returns {MessageForm}
     */
    button1(...args: Parameters<MessageFormData['button1']>): MessageForm;
    /**
     * Set button2 on the form (callbackable)
     * @param {...Parameters<MessageFormData['button2']>} args
     * @returns {MessageForm}
     */
    button2(...args: Parameters<MessageFormData['button2']>): MessageForm;
}
/**
 * A form that implements MessageFormData with callbacks for buttons, closing, and user busy that can be shown to a player with a title, body, and two buttons (callbackable)
 */
export declare class MessageForm extends MessageFormWithoutCallback implements MessageFormData {
    constructor();
    /**
     * Add a callback to the last callbackable element method called (cannot call callback after this method is called)
     * @param {(receiver: Player, i: number) => void} callback
     */
    callback(callback: (receiver: Player, i: number) => void): MessageFormWithoutCallback;
}
/**
 * this is an enum for the last callbackable element method called
 * @enum {number}
 */
declare enum LastCallCallbackable {
    none = -1,
    dropdown = 0,
    slider = 1,
    textFeild = 2,
    toggle = 3
}
/**
 * This class basically controls when callback can be called for callbackable elements
 */
declare class ModalFormWithoutCallback extends Form {
    /**
     * @type {ModalFormData}
     */
    protected root: ModalFormData;
    /**
     * @type {(((receiver: Player, data: string | number | boolean, i: number) => void) | undefined)[]}
     */
    protected callbacks: (((receiver: Player, data: string | number | boolean, i: number) => void) | undefined)[];
    /**
     * @type {LastCallCallbackable}
     */
    protected lastCallCallbackable: LastCallCallbackable;
    constructor();
    /**
     * Set the title of the form (cannot call callback after this method is called)
     * @param {...Parameters<ModalFormData['title']>} args
     * @returns {this}
     */
    title(...args: Parameters<ModalFormData['title']>): this;
    /**
     * Addes a dropdown to the form (callbackable)
     * @param {...Parameters<ModalFormData['dropdown']>} args
     * @returns {ModalFormWithCallback<number>}
     */
    dropdown(...args: Parameters<ModalFormData['dropdown']>): ModalFormWithCallback<number>;
    /**
     * Addes a slider to the form (callbackable)
     * @param {...Parameters<ModalFormData['slider']>} args
     * @returns {ModalFormWithCallback<number>}
     */
    slider(...args: Parameters<ModalFormData['slider']>): ModalFormWithCallback<number>;
    /**
     * Addes a text field to the form (callbackable)
     * @param {...Parameters<ModalFormData['textField']>} args
     * @returns {ModalFormWithCallback<string>}
     */
    textField(...args: Parameters<ModalFormData['textField']>): ModalFormWithCallback<string>;
    /**
     * Addes a toggle to the form (callbackable)
     * @param {...Parameters<ModalFormData['toggle']>} args
     * @returns {ModalFormWithCallback<boolean>}
     */
    toggle(...args: Parameters<ModalFormData['toggle']>): ModalFormWithCallback<boolean>;
    /**
     * Show the form to a player and runs a callback if available depending what action or state the player is in or inputed (cannot call callback after this method is called)
     * @param {Player} receiver
     * @returns {Promise<ModalFormResponse>}
     */
    show(receiver: Player): Promise<ModalFormResponse>;
    /**
     * await until the player is not busy then Show the form to a player and runs a callback if available depending what action or state the player is in or inputed (cannot call callback after this method is called)
     * @param {Player} receiver
     * @returns {Promise<ModalFormResponse>}
     */
    showAwaitNotBusy(receiver: Player): Promise<ModalFormResponse | undefined>;
}
export declare class ModalFormWithCallback<lastCallbackData extends string | number | boolean> extends ModalFormWithoutCallback {
    constructor();
    /**
     * Add a callback to the last callbackable element method called (cannot call callback after this method is called)
     * @param {(receiver: Player, data: lastCallbackData, i: number) => void} callback
     * @returns {ModalFormWithoutCallback}
     */
    callback(callback: (receiver: Player, data: lastCallbackData, i: number) => void): ModalFormWithoutCallback;
}
export declare class ModalForm extends ModalFormWithCallback<string | number | boolean> implements ModalFormData {
    constructor();
}
export {};
