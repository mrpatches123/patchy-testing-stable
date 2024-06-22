import { StorageChangedEventTemplate } from "./storage_changed_template";
import { iterateObject } from "../utilities";
export class JSONDynamicPropertyChangedEvent extends StorageChangedEventTemplate {
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
export const jsonDynamicPropertyChanged = new JSONDynamicPropertyChangedEvent();
//# sourceMappingURL=json_dynamic_property_changed.js.map