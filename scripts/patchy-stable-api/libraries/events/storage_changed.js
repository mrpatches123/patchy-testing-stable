import { iterateObject } from "../utilities";
import { DynamicPropertyTypes } from "../properties";
var StorageChangedTypeNew;
(function (StorageChangedTypeNew) {
    StorageChangedTypeNew["Score"] = "score";
    StorageChangedTypeNew["All"] = "all";
})(StorageChangedTypeNew || (StorageChangedTypeNew = {}));
export const StorageChangedType = {
    ...StorageChangedTypeNew,
    ...DynamicPropertyTypes,
};
export class StorageChangedEvent {
    currentSubscribeId = 0;
    subscriptions = {};
    currentSubscribes = 0;
    runId;
    subscribe(callback) {
        const subscribeId = this.currentSubscribeId++;
        this.subscriptions[subscribeId] = callback;
        this.currentSubscribes++;
        return subscribeId;
    }
    runEvent(target, key, type, previousValue, currentValue) {
        const data = { target, key, type, previousValue, currentValue, cancel: false, cancelCache: false, cancelSet: false };
        iterateObject(this.subscriptions, (id, callback) => callback(data));
        return data;
    }
    unsubscribe(id) {
        delete this.subscriptions[id];
    }
}
export const storageChanged = new StorageChangedEvent();
