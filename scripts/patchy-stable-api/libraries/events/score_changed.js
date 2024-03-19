import { iterateObject } from "../utilities";
import { ScoreChangedEventTemplate } from "./score_changed_template";
export class BooleanDynamicPropertyChangedEvent extends ScoreChangedEventTemplate {
    constructor() {
        super();
    }
    subscribe(callback) {
        const subscribeId = this.currentSubscribeId++;
        this.subscriptions[subscribeId] = callback;
        this.currentSubscribes++;
        return subscribeId;
    }
    runEvent(target, key, previousValue, currentValue) {
        const data = { target, key, previousValue, currentValue, cancel: false };
        iterateObject(this.subscriptions, (id, callback) => callback(data));
        return data;
    }
}
export const scoreChanged = new BooleanDynamicPropertyChangedEvent();
