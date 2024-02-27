import { Player } from '@minecraft/server';
import { ActionFormData, MessageFormData, ModalFormData } from '@minecraft/server-ui';
declare class Form {
    protected _closeCallback?: (receiver: Player) => void;
    protected _busyCallback?: (receiver: Player) => void;
    protected lastCallCallbackable: boolean | -1 | 0 | 1 | 2 | 3;
    /**
     * Sets the callback for when the form is closed (cannot call callback after this method is called)
     */
    closeCallback(callback: (receiver: Player) => void): this;
    /**
     * Sets the callback for when the user is busy (cannot call callback after this method is called)
     */
    busyCallback(callback: (receiver: Player) => void): this;
}
declare class ButtonForm extends Form {
    protected root: ActionFormData | MessageFormData;
    protected callbacks: (((receiver: Player, i: number) => void) | undefined)[];
    constructor();
    /**
     * Show the form to a player and runs a callback if available depending what action or state the player is in or inputed (cannot call callback after this method is called)
     */
    show(receiver: Player): Promise<import("@minecraft/server-ui").ActionFormResponse>;
}
/**
 * This class basically controls when callback can be called for callbackable elements
 */
declare class ActionFormWithoutCallback extends ButtonForm {
    protected callbacks: (((receiver: Player, i: number) => void) | undefined)[];
    protected root: ActionFormData;
    protected lastCallCallbackable: boolean;
    constructor();
    /**
     * Add a button to the form (callbackable)
     */
    button(...args: Parameters<ActionFormData['button']>): ActionForm;
    /**
     * Set the title of the form (cannot call callback after this method is called)
     */
    title(...args: Parameters<ActionFormData['title']>): this;
    /**
     * Sets the body of the form (cannot call callback after this method is called)
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
 */
    callback(callback: (receiver: Player, i: number) => void): ActionFormWithoutCallback;
}
/**
 * This class basically controls when callback can be called for callbackable elements
 */
declare class MessageFormWithoutCallback extends ButtonForm {
    protected callbacks: [((receiver: Player, i: number) => void) | undefined, ((receiver: Player, i: number) => void) | undefined];
    protected root: MessageFormData;
    protected lastCallCallbackable: -1 | 0 | 1;
    constructor();
    /**
     * Set the title of the form (cannot call callback after this method is called)
     */
    title(...args: Parameters<MessageFormData['title']>): this;
    /**
     * Sets the body of the form (cannot call callback after this method is called)
     */
    body(...args: Parameters<MessageFormData['body']>): this;
    /**
     * Set button1 on the form (callbackable)
     */
    button1(...args: Parameters<MessageFormData['button1']>): MessageForm;
    /**
     * Set button2 on the form (callbackable)
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
     */
    callback(callback: (receiver: Player, i: number) => void): MessageFormWithoutCallback;
}
/**
 * this is an enum for the last callbackable element method called
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
    protected root: ModalFormData;
    protected callbacks: (((receiver: Player, data: string | number | boolean, i: number) => void) | undefined)[];
    protected lastCallCallbackable: LastCallCallbackable;
    constructor();
    /**
     * Set the title of the form (cannot call callback after this method is called)
     */
    title(...args: Parameters<ModalFormData['title']>): this;
    /**
     * Addes a dropdown to the form (callbackable)
     */
    dropdown(...args: Parameters<ModalFormData['dropdown']>): ModalFormWithCallback<number>;
    /**
     * Addes a slider to the form (callbackable)
     */
    slider(...args: Parameters<ModalFormData['slider']>): ModalFormWithCallback<number>;
    /**
     * Addes a text field to the form (callbackable)
     */
    textField(...args: Parameters<ModalFormData['textField']>): ModalFormWithCallback<string>;
    /**
     * Addes a toggle to the form (callbackable)
     */
    toggle(...args: Parameters<ModalFormData['toggle']>): ModalFormWithCallback<boolean>;
    /**
     * Show the form to a player and runs a callback if available depending what action or state the player is in or inputed (cannot call callback after this method is called)
     */
    show(receiver: Player): Promise<import("@minecraft/server-ui").ModalFormResponse>;
}
export declare class ModalFormWithCallback<lastCallbackData extends string | number | boolean> extends ModalFormWithoutCallback {
    constructor();
    /**
     * Add a callback to the last callbackable element method called (cannot call callback after this method is called)
     */
    callback(callback: (receiver: Player, data: lastCallbackData, i: number) => void): ModalFormWithoutCallback;
}
export declare class ModalForm extends ModalFormWithCallback<string | number | boolean> implements ModalFormData {
    constructor();
}
export {};
