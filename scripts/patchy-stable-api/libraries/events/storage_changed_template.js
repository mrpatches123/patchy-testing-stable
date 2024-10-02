import { iterateObject } from "../utilities";
export class StorageChangedEventTemplate {
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
    runEvent(target, key, previousValue, currentValue) {
        const data = { target, key, previousValue, currentValue, cancel: false };
        iterateObject(this.subscriptions, (id, callback) => callback(data));
        return data;
    }
    unsubscribe(id) {
        delete this.subscriptions[id];
    }
}
