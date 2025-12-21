import { system } from "@minecraft/server";
import { storage } from "./properties";
import { customEvents } from "./events";
import { isDefined } from "./utilities";
var CountDirection;
(function (CountDirection) {
    CountDirection["Up"] = "Up";
    CountDirection["Down"] = "Down";
})(CountDirection || (CountDirection = {}));
export class TimerDoneEvent {
    Date = new Date();
    eventIds = 0;
    callbacks = [];
    subscribedCheck = false;
    endDate = Date.now();
    subscribeCheck() {
        if (this.subscribedCheck)
            return;
        if (!this.callbacks.length)
            return;
        const thisEvent = this;
        const runId = system.runInterval(() => {
            if (!this.callbacks.length)
                system.clearRun(runId);
            if (thisEvent.Date.getTime() - this.endDate < 0)
                return;
            this.run();
            system.clearRun(runId);
        });
        this.subscribedCheck = true;
    }
    subscribe(callback) {
        const eventId = this.eventIds++;
        this.callbacks.push([eventId, callback]);
        this.subscribeCheck();
        return eventId;
    }
    unsubscribe(eventId) {
        this.callbacks = this.callbacks.filter(([eventIdSearch]) => eventIdSearch !== eventId);
    }
    run() {
        this.callbacks.forEach(callback => {
            callback[1]?.();
        });
    }
}
let loaded = false;
customEvents.worldInitialize.subscribe(() => {
    const worldStorage = storage.get();
    worldStorage.numbers.loadId ??= Number.MIN_SAFE_INTEGER;
    worldStorage.numbers.loadId++;
    loaded = true;
});
export class Timer {
    startDate = new Date().getTime();
    countDirection = CountDirection.Up;
    startTime = undefined;
    onTimerDone = new TimerDoneEvent();
    static getLoadId() {
        if (!loaded)
            return undefined;
        const worldStorage = storage.get();
        return worldStorage.getNumber("loadId");
    }
    static removeTimerFromEntity(entity, key) {
        const loadId = Timer.getLoadId();
        if (!loadId)
            return false;
        const entityStorage = storage.get(entity);
        entityStorage.numbers[`${key}:timerTime`] = undefined;
        entityStorage.numbers[`${key}:startTime`] = undefined;
        entityStorage.numbers[`${key}:startDate`] = undefined;
        entityStorage.numbers[`${key}:loadId`] = undefined;
        entityStorage.strings[`${key}:countDirection`] = undefined;
        entityStorage.booleans[`${key}:keepTime`] = undefined;
    }
    static getFromItemStack(itemStack, key) {
        const currentLoadId = Timer.getLoadId();
        if (!loaded)
            return false;
        const countDirection = itemStack.getDynamicProperty(`${key}:countDirection`);
        const timerTime = itemStack.getDynamicProperty(`${key}:timerTime`);
        const startTime = itemStack.getDynamicProperty(`${key}:startTime`);
        const loadId = itemStack.getDynamicProperty(`${key}:loadId`);
        const startDate = itemStack.getDynamicProperty(`${key}:startDate`);
        const keepTime = itemStack.getDynamicProperty(`${key}:keepTime`);
        if (!isDefined(timerTime) || !countDirection || !isDefined(startTime) || !isDefined(loadId) || !isDefined(startDate))
            return;
        const timer = new Timer();
        if (startTime && countDirection === CountDirection.Down)
            timer.setCountDown(startTime);
        timer.setCurrentTime(timerTime, true);
        if ((keepTime !== undefined && keepTime) || loadId === currentLoadId)
            timer.startDate = startDate;
        return timer;
    }
    static getFromEntity(entity, key) {
        const currentLoadId = Timer.getLoadId();
        if (!loaded)
            return false;
        const entityStorage = storage.get(entity);
        const { strings: { [`${key}:countDirection`]: countDirection }, numbers: { [`${key}:timerTime`]: timerTime, [`${key}:startTime`]: startTime, [`${key}:loadId`]: loadId, [`${key}:startDate`]: startDate }, booleans: { [`${key}:keepTime`]: keepTime } } = entityStorage;
        if (!isDefined(timerTime) || !countDirection || !isDefined(startTime) || !isDefined(loadId) || !isDefined(startDate))
            return;
        const timer = new Timer();
        if (startTime && countDirection === CountDirection.Down)
            timer.setCountDown(startTime);
        timer.setCurrentTime(timerTime, true);
        if ((keepTime !== undefined && keepTime) || loadId === currentLoadId)
            timer.startDate = startDate;
        return timer;
    }
    saveToEntity(entity, key, keepTime = false) {
        const loadId = Timer.getLoadId();
        if (!loadId)
            return false;
        const entityStorage = storage.get(entity);
        entityStorage.numbers[`${key}:timerTime`] = new Date().getTime() - this.startDate;
        entityStorage.numbers[`${key}:startTime`] = this.startTime;
        entityStorage.numbers[`${key}:startDate`] = this.startDate;
        entityStorage.numbers[`${key}:loadId`] = loadId;
        entityStorage.strings[`${key}:countDirection`] = this.countDirection;
        entityStorage.booleans[`${key}:keepTime`] = keepTime;
        return true;
    }
    saveToItemStack(itemStack, key, keepTime = false) {
        const loadId = Timer.getLoadId();
        if (!loadId)
            return false;
        itemStack.setDynamicProperty(`${key}:timerTime`, new Date().getTime() - this.startDate);
        itemStack.setDynamicProperty(`${key}:startTime`, this.startTime);
        itemStack.setDynamicProperty(`${key}:startDate`, this.startDate);
        itemStack.setDynamicProperty(`${key}:loadId`, loadId);
        itemStack.setDynamicProperty(`${key}:countDirection`, this.countDirection);
        itemStack.setDynamicProperty(`${key}:keepTime`, keepTime);
    }
    getTime() {
        if (this.countDirection === CountDirection.Down) {
            //console.warn(JSON.stringify({ startTime: this.startTime, time: new Date().getTime() - this.startDate }));
            if (this.startTime === undefined)
                throw new Error("CountDirection is down but startTime is not defined");
            const time = this.startTime - (new Date().getTime() - this.startDate);
            return (time < 0) ? 0 : time;
        }
        return new Date().getTime() - this.startDate;
    }
    restart() {
        this.startDate = new Date().getTime();
        return this;
    }
    setCurrentTime(time, ingoreDown) {
        if (!ingoreDown && this.countDirection === CountDirection.Down) {
            if (this.startTime === undefined)
                throw new Error("CountDirection is down but startTime is not defined");
            const time = this.startTime - (new Date().getTime() - this.startDate);
            this.startDate = new Date().getTime() - (this.startTime - time);
            return this;
        }
        this.startDate = new Date().getTime() - time;
        return this;
    }
    setCountDown(startTime) {
        const currentDate = new Date().getTime();
        this.startTime = startTime;
        this.startDate = currentDate;
        this.onTimerDone.endDate = currentDate + startTime;
        this.countDirection = CountDirection.Down;
        this.onTimerDone.subscribeCheck();
        return this;
    }
}
