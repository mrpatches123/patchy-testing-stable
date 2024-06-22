import { StorageChangedEventTemplate } from "./storage_changed_template";
import { iterateObject } from "../utilities";
export class Vector3DynamicPropertyChangedEvent extends StorageChangedEventTemplate {
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
        const data = { target, previousValue, key, currentValue, cancel: false };
        iterateObject(this.subscriptions, (id, callback) => callback(data));
        return data;
    }
}
export const vector3DynamicPropertyChanged = new Vector3DynamicPropertyChangedEvent();
//# sourceMappingURL=vector3_dynamic_property_changed.js.map