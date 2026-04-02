import { Player, World, world } from "@minecraft/server";
import { chunkString, isDefined, isVector3 } from "./utilities";
import { customEvents } from "./events";
import { StorageChangedType } from "./events/storage_changed";
export class Storage {
    managers = { 'world': new WorldStorageManager(world) };
    get(target) {
        if (!target)
            return this.managers['world'];
        if (target instanceof World)
            return this.managers['world'];
        const { id } = target;
        this.managers[id] ??= new EntityStorageManager(target);
        return this.managers[id];
    }
    constructor() {
        world.afterEvents.playerLeave.subscribe(({ playerId }) => {
            delete this.managers[playerId];
        });
        world.afterEvents.entityRemove.subscribe(({ removedEntityId }) => {
            delete this.managers[removedEntityId];
        });
        world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
            if (deadEntity instanceof Player)
                return;
            delete this.managers[deadEntity.id];
        });
    }
}
export var DynamicPropertyTypes;
(function (DynamicPropertyTypes) {
    DynamicPropertyTypes["String"] = "string";
    DynamicPropertyTypes["Number"] = "number";
    DynamicPropertyTypes["Boolean"] = "boolean";
    DynamicPropertyTypes["Vector3"] = "vector3";
    DynamicPropertyTypes["JSON"] = "json";
})(DynamicPropertyTypes || (DynamicPropertyTypes = {}));
const fixObjectiveName = '$entity$_$storage234';
let fixObjective;
customEvents.worldInitialize.subscribe(() => {
    try {
        fixObjective = world.scoreboard.addObjective(fixObjectiveName);
    }
    catch {
        fixObjective = world.scoreboard.getObjective(fixObjectiveName);
    }
});
const chunkAmountJSON = 10922;
class DynamicPropertyManager {
    dynamicProperties = {};
    root;
    constructor(root) {
        this.root = root;
    }
    setInternal(key, value, data) {
        const { type, specificEvent, removeFunction, getFunction, typeCheck, setFunction } = data;
        if (typeof key !== "string")
            throw new Error(`key is not of type string`);
        if (isDefined(value) && !typeCheck(value))
            throw new Error(`value is defined and is not of type: ${type}`);
        const { type: typeCached = type, gotten = false } = this.dynamicProperties[key] ?? {};
        if (typeCached !== type)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        let cancel, cancelCache, cancelSet = false;
        if (!isDefined(value))
            return removeFunction(key);
        const gottenValue = getFunction(key);
        const { cancel: cancelSpecific, cancelCache: cancelCacheSpecific, cancelSet: cancelSetSpecific } = specificEvent.runEvent(this.root, key, gottenValue, value);
        const { cancel: cancelStorage, cancelCache: cancelCacheStorage, cancelSet: cancelSetStorage } = customEvents.storageChanged.runEvent(this.root, key, type, gottenValue, value);
        cancel = cancelSpecific || cancelStorage;
        cancelCache = cancelCacheSpecific || cancelCacheStorage;
        cancelSet = cancelSetSpecific || cancelSetStorage;
        if (cancel)
            return;
        if (!cancelCache) {
            this.dynamicProperties[key] ??= {};
            this.dynamicProperties[key].type = type;
            this.dynamicProperties[key].value = value;
            this.dynamicProperties[key].gotten = true;
        }
        if (cancelSet)
            return;
        setFunction(key, value);
    }
    setString(key, value) {
        this.setInternal(key, value ?? undefined, {
            getFunction: this.getString.bind(this),
            specificEvent: customEvents.stringDynamicPropertyChanged,
            removeFunction: this.removeString.bind(this),
            type: DynamicPropertyTypes.String,
            typeCheck: (value) => typeof value === "string",
            setFunction: this.root.setDynamicProperty.bind(this.root)
        });
    }
    getString(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.String, gotten = false } = this.dynamicProperties[key] ?? {};
        this.dynamicProperties[key] ??= {};
        if (type !== DynamicPropertyTypes.String)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        if (!gotten) {
            this.dynamicProperties[key].gotten = true;
            this.dynamicProperties[key].value = this.root.getDynamicProperty(key);
            this.dynamicProperties[key].type = DynamicPropertyTypes.String;
        }
        return this.dynamicProperties[key]?.value;
    }
    setJSON(key, value) {
        this.setInternal(key, value ?? undefined, {
            getFunction: this.getJSON.bind(this),
            specificEvent: customEvents.jsonDynamicPropertyChanged,
            removeFunction: this.removeJSON.bind(this),
            type: DynamicPropertyTypes.JSON,
            typeCheck: (value) => true,
            setFunction: (key, value) => {
                const stringValue = JSON.stringify(value);
                const chunks = chunkString(stringValue, chunkAmountJSON);
                const previousChunks = (this.root.getDynamicProperty(`${key}_chunks`) ?? 0);
                if (previousChunks > chunks.length) {
                    for (let i = chunks.length; i < previousChunks; i++) {
                        this.root.setDynamicProperty(`${key}_${i}`, undefined);
                    }
                }
                chunks.forEach((chunk, index) => {
                    this.root.setDynamicProperty(`${key}_${index}`, chunk);
                });
                this.root.setDynamicProperty(`${key}_chunks`, chunks.length);
            }
        });
    }
    getJSON(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.JSON, gotten = false } = this.dynamicProperties[key] ?? {};
        this.dynamicProperties[key] ??= {};
        if (type !== DynamicPropertyTypes.JSON)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        if (!gotten) {
            const chunks = Array.from({ length: (this.root.getDynamicProperty(`${key}_chunks`) ?? 0) }, (_, index) => this.root.getDynamicProperty(`${key}_${index}`));
            this.dynamicProperties[key].gotten = true;
            try {
                this.dynamicProperties[key].value = JSON.parse(chunks.join(''));
            }
            catch (error) {
                // console.warn(`Error parsing JSON for key: ${key}, ${error.stack}`);
                this.dynamicProperties[key].value = undefined;
            }
            this.dynamicProperties[key].type = DynamicPropertyTypes.JSON;
        }
        return this.dynamicProperties[key]?.value;
    }
    setNumber(key, value) {
        this.setInternal(key, value ?? undefined, {
            getFunction: this.getNumber.bind(this),
            specificEvent: customEvents.numberDynamicPropertyChanged,
            removeFunction: this.removeNumber.bind(this),
            type: DynamicPropertyTypes.Number,
            typeCheck: (value) => typeof value === "number",
            setFunction: this.root.setDynamicProperty.bind(this.root)
        });
    }
    getNumber(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.Number, gotten = false } = this.dynamicProperties[key] ?? {};
        this.dynamicProperties[key] ??= {};
        if (type !== DynamicPropertyTypes.Number)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        if (!gotten) {
            this.dynamicProperties[key].gotten = true;
            this.dynamicProperties[key].value = this.root.getDynamicProperty(key);
            this.dynamicProperties[key].type = DynamicPropertyTypes.Number;
        }
        return this.dynamicProperties[key]?.value;
    }
    setBoolean(key, value) {
        this.setInternal(key, value ?? undefined, {
            getFunction: this.getBoolean.bind(this),
            specificEvent: customEvents.booleanDynamicPropertyChanged,
            removeFunction: this.removeBoolean.bind(this),
            type: DynamicPropertyTypes.Boolean,
            typeCheck: (value) => typeof value === "boolean",
            setFunction: this.root.setDynamicProperty.bind(this.root)
        });
    }
    getBoolean(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.Boolean, gotten = false } = this.dynamicProperties[key] ?? {};
        this.dynamicProperties[key] ??= {};
        if (type !== DynamicPropertyTypes.Boolean)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        if (!gotten) {
            this.dynamicProperties[key].gotten = true;
            this.dynamicProperties[key].value = this.root.getDynamicProperty(key);
            this.dynamicProperties[key].type = DynamicPropertyTypes.Boolean;
        }
        return this.dynamicProperties[key]?.value;
    }
    setVector3(key, value) {
        this.setInternal(key, value ?? undefined, {
            getFunction: this.getVector3.bind(this),
            specificEvent: customEvents.vector3DynamicPropertyChanged,
            removeFunction: this.removeVector3.bind(this),
            type: DynamicPropertyTypes.Vector3,
            typeCheck: isVector3,
            setFunction: this.root.setDynamicProperty.bind(this.root)
        });
    }
    getVector3(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.Vector3, gotten = false } = this.dynamicProperties[key] ?? {};
        this.dynamicProperties[key] ??= {};
        if (type !== DynamicPropertyTypes.Vector3)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        if (!gotten) {
            this.dynamicProperties[key].gotten = true;
            this.dynamicProperties[key].value = this.root.getDynamicProperty(key);
            this.dynamicProperties[key].type = DynamicPropertyTypes.Vector3;
        }
        return this.dynamicProperties[key]?.value;
    }
    removeInternal(key, data) {
        const { type, specificEvent, removeFunction, getFunction } = data;
        if (typeof key !== "string")
            throw new Error(`key is not of type string`);
        const { type: typeCached = type, gotten = false } = this.dynamicProperties[key] ?? {};
        if (typeCached !== type)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        let cancel, cancelCache, cancelSet = false;
        const gottenValue = getFunction(key);
        const { cancel: cancelSpecific, cancelCache: cancelCacheSpecific, cancelSet: cancelSetSpecific } = specificEvent.runEvent(this.root, key, gottenValue, undefined);
        const { cancel: cancelStorage, cancelCache: cancelCacheStorage, cancelSet: cancelSetStorage } = customEvents.storageChanged.runEvent(this.root, key, type, gottenValue, undefined);
        cancel = cancelSpecific || cancelStorage;
        cancelCache = cancelCacheSpecific || cancelCacheStorage;
        cancelSet = cancelSetSpecific || cancelSetStorage;
        if (cancel)
            return;
        if (!cancelCache) {
            this.dynamicProperties[key] ??= {};
            this.dynamicProperties[key].type = type;
            this.dynamicProperties[key].gotten = true;
            delete this.dynamicProperties[key].value;
        }
        if (cancelSet)
            return;
        removeFunction(key);
    }
    removeString(key) {
        this.removeInternal(key, {
            getFunction: this.getString.bind(this),
            specificEvent: customEvents.stringDynamicPropertyChanged,
            type: DynamicPropertyTypes.String,
            removeFunction: this.root.setDynamicProperty.bind(this.root),
        });
    }
    removeJSON(key) {
        this.removeInternal(key, {
            getFunction: this.getJSON.bind(this),
            specificEvent: customEvents.jsonDynamicPropertyChanged,
            type: DynamicPropertyTypes.JSON,
            removeFunction: (key) => {
                const previousChunks = (this.root.getDynamicProperty(`${key}_chunks`) ?? 0);
                for (let i = 0; i < previousChunks; i++) {
                    this.root.setDynamicProperty(`${key}_${i}`, undefined);
                }
            }
        });
    }
    removeNumber(key) {
        this.removeInternal(key, {
            getFunction: this.getNumber.bind(this),
            specificEvent: customEvents.numberDynamicPropertyChanged,
            type: DynamicPropertyTypes.Number,
            removeFunction: this.root.setDynamicProperty.bind(this.root),
        });
    }
    removeBoolean(key) {
        this.removeInternal(key, {
            getFunction: this.getBoolean.bind(this),
            specificEvent: customEvents.booleanDynamicPropertyChanged,
            type: DynamicPropertyTypes.Boolean,
            removeFunction: this.root.setDynamicProperty.bind(this.root),
        });
    }
    removeVector3(key) {
        this.removeInternal(key, {
            getFunction: this.getVector3.bind(this),
            specificEvent: customEvents.vector3DynamicPropertyChanged,
            type: DynamicPropertyTypes.Vector3,
            removeFunction: this.root.setDynamicProperty.bind(this.root),
        });
    }
    /**
     * runs storageChanged event for all keys
     */
    clearAllDynamicProperties() {
        let cancel = false;
        this.root.getDynamicPropertyIds().forEach(key => {
            let previousValue;
            let type = StorageChangedType.All;
            switch (this.dynamicProperties[key]?.type) {
                case DynamicPropertyTypes.String:
                    previousValue = this.getString(key);
                    cancel = customEvents.stringDynamicPropertyChanged.runEvent(this.root, key, previousValue, undefined).cancel;
                    type = StorageChangedType.String;
                    break;
                case DynamicPropertyTypes.Number:
                    previousValue = this.getNumber(key);
                    cancel = customEvents.numberDynamicPropertyChanged.runEvent(this.root, key, previousValue, undefined).cancel;
                    type = StorageChangedType.Number;
                    break;
                case DynamicPropertyTypes.Boolean:
                    previousValue = this.getBoolean(key);
                    cancel = customEvents.booleanDynamicPropertyChanged.runEvent(this.root, key, previousValue, undefined).cancel;
                    type = StorageChangedType.Boolean;
                    break;
                case DynamicPropertyTypes.Vector3:
                    previousValue = this.getVector3(key);
                    cancel = customEvents.vector3DynamicPropertyChanged.runEvent(this.root, key, previousValue, undefined).cancel;
                    type = StorageChangedType.Vector3;
                    break;
                default:
                    previousValue = undefined;
            }
            cancel = customEvents.storageChanged.runEvent(this.root, key, type, previousValue, undefined).cancel;
        });
        if (cancel)
            return;
        this.root.clearDynamicProperties();
        this.dynamicProperties = {};
    }
    get strings() {
        const thisEntityStorage = this;
        return new Proxy({}, {
            set: (target, key, value, receiver) => {
                thisEntityStorage.setString(key, value);
                return Reflect.set(target, key, value, receiver);
            },
            get: (target, key, receiver) => {
                return thisEntityStorage.getString(key);
            }
        });
    }
    get jsons() {
        const thisEntityStorage = this;
        return new Proxy({}, {
            set: (target, key, value, receiver) => {
                thisEntityStorage.setJSON(key, value);
                return Reflect.set(target, key, value, receiver);
            },
            get: (target, key, receiver) => {
                return thisEntityStorage.getJSON(key);
            }
        });
    }
    get numbers() {
        const thisEntityStorage = this;
        return new Proxy({}, {
            set: (target, key, value, receiver) => {
                thisEntityStorage.setNumber(key, value);
                return Reflect.set(target, key, value, receiver);
            },
            get: (target, key, receiver) => {
                return thisEntityStorage.getNumber(key);
            }
        });
    }
    get booleans() {
        const thisEntityStorage = this;
        return new Proxy({}, {
            set: (target, key, value, receiver) => {
                thisEntityStorage.setBoolean(key, value);
                return Reflect.set(target, key, value, receiver);
            },
            get: (target, key, receiver) => {
                return thisEntityStorage.getBoolean(key);
            }
        });
    }
    get vector3s() {
        const thisEntityStorage = this;
        return new Proxy({}, {
            set: (target, key, value, receiver) => {
                thisEntityStorage.setVector3(key, value);
                return Reflect.set(target, key, value, receiver);
            },
            get: (target, key, receiver) => {
                return thisEntityStorage.getVector3(key);
            }
        });
    }
}
class EntityStorageManager extends DynamicPropertyManager {
    setScore(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && typeof value !== 'number')
            throw new Error('value is defined and is not of type number');
        if (!isDefined(value))
            return this.removeScore(key);
        this.scoresStorage[key] ??= {};
        let { objective } = this.scoresStorage[key];
        if (!objective) {
            objective = world.scoreboard.getObjective(key);
            this.scoresStorage[key].objective ??= objective;
            if (!objective)
                throw new Error(`objective doesn't exist: ${key}`);
        }
        this.scoresStorage[key] ??= {};
        this.scoresStorage[key].value = value;
        this.scoresStorage[key].gotten = true;
        if (!isDefined(value))
            return objective.removeParticipant(this.root);
        objective.setScore(this.root, value);
    }
    getScore(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        this.scoresStorage[key] ??= {};
        if (!this.scoresStorage[key]?.gotten) {
            let { objective } = this.scoresStorage[key] ?? {};
            if (!objective) {
                objective = world.scoreboard.getObjective(key);
                this.scoresStorage[key].objective ??= objective;
                if (!objective)
                    throw new Error(`objective doesn't exist: ${key}`);
            }
            this.scoresStorage[key].gotten = true;
            if (!this.root.scoreboardIdentity) {
                if (!fixObjective)
                    return;
                fixObjective.setScore(this.root, 0);
            }
            this.scoresStorage[key].value = objective.getScore(this.root);
        }
        return this.scoresStorage[key]?.value;
    }
    clearAllScores() {
        this.root.runCommand(`scoreboard players reset @s`);
        this.scoresStorage = {};
    }
    clearAll() {
        this.clearAllScores();
        this.clearAllDynamicProperties();
    }
    removeScore(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const objective = this.scoresStorage[key]?.objective ?? world.scoreboard.getObjective(key);
        objective?.removeParticipant(this.root);
        this.scoresStorage[key] ??= {};
        this.scoresStorage[key].gotten = true;
        delete this.scoresStorage[key].value;
    }
    root;
    constructor(root) {
        super(root);
        this.root = root;
    }
    scoresStorage = {};
    get scores() {
        const thisEntityStorage = this;
        return new Proxy({}, {
            set: (target, key, value, receiver) => {
                thisEntityStorage.setScore(key, value);
                return Reflect.set(target, key, value, receiver);
            },
            get: (target, key, receiver) => {
                return thisEntityStorage.getScore(key);
            }
        });
    }
}
class WorldStorageManager extends DynamicPropertyManager {
    root;
    scoresStorage = {};
    constructor(root) {
        super(root);
        this.root = root;
    }
    setScore(key, dummyName, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && typeof value !== 'number')
            throw new Error('value is defined and is not of type number');
        this.scoresStorage[key] ??= {};
        this.scoresStorage[key][dummyName] ??= {};
        let { objective } = this.scoresStorage[key]?.[dummyName] ?? {};
        this.scoresStorage[key] ??= {};
        this.scoresStorage[key][dummyName] ?? {};
        if (!objective) {
            objective = world.scoreboard.getObjective(key);
            this.scoresStorage[key][dummyName].objective ??= objective;
            if (!objective)
                throw new Error(`objective doesn't exist: ${key}`);
        }
        this.scoresStorage[key][dummyName].value = value;
        this.scoresStorage[key][dummyName].gotten = true;
        if (!isDefined(value))
            return objective.removeParticipant(key);
        objective.setScore(dummyName, value);
    }
    getScore(key, dummyName) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        this.scoresStorage[key] ??= {};
        this.scoresStorage[key][dummyName] ??= {};
        if (!this.scoresStorage[key]?.gotten) {
            let { objective } = this.scoresStorage[key]?.[dummyName] ?? {};
            if (!objective) {
                objective = world.scoreboard.getObjective(key);
                this.scoresStorage[key][dummyName].objective ??= objective;
                if (!objective)
                    throw new Error(`objective doesn't exist: ${key}`);
            }
            if (!this.scoresStorage[key][dummyName].gotten) {
                this.scoresStorage[key][dummyName].gotten = true;
                this.scoresStorage[key][dummyName].value = objective.getScore(dummyName);
            }
        }
        return this.scoresStorage[key]?.[dummyName]?.value;
    }
    removeScore(key, dummyName) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const objective = this.scoresStorage[key]?.[dummyName]?.objective ?? world.scoreboard.getObjective(key);
        objective?.removeParticipant(dummyName);
        this.scoresStorage[key] ??= {};
        this.scoresStorage[key][dummyName].gotten = true;
        delete this.scoresStorage[key][dummyName].value;
    }
    get scores() {
        const thisEntityStorage = this;
        return new Proxy({}, {
            get: (target, key, receiver) => {
                return new Proxy({}, {
                    set: (target, dummyName, value, receiver) => {
                        thisEntityStorage.setScore(key, dummyName, value);
                        return Reflect.set(target, key, value, receiver);
                    },
                    get: (target, dummyName, receiver) => {
                        return thisEntityStorage.getScore(key, dummyName);
                    }
                });
            }
        });
    }
}
;
export const storage = new Storage();
