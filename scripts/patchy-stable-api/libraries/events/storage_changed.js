import { iterateObject } from "../utilities";
export var StorageChangedType;
(function (StorageChangedType) {
    StorageChangedType["Number"] = "number";
    StorageChangedType["Boolean"] = "boolean";
    StorageChangedType["String"] = "string";
    StorageChangedType["Vector3"] = "vector3";
    StorageChangedType["Score"] = "score";
    StorageChangedType["All"] = "all";
})(StorageChangedType || (StorageChangedType = {}));
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
        const data = { target, key, type, previousValue, currentValue, cancel: false };
        iterateObject(this.subscriptions, (id, callback) => callback(data));
        return data;
    }
    unsubscribe(id) {
        delete this.subscriptions[id];
    }
}
export const storageChanged = new StorageChangedEvent();
