import { Player, World, world } from "@minecraft/server";
import { chunkString, isDefined, isVector3 } from "./utilities";
import { StorageChangedType, customEvents } from "./events";
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
var DynamicPropertyTypes;
(function (DynamicPropertyTypes) {
    DynamicPropertyTypes["string"] = "string";
    DynamicPropertyTypes["number"] = "number";
    DynamicPropertyTypes["boolean"] = "boolean";
    DynamicPropertyTypes["vector3"] = "vector3";
    DynamicPropertyTypes["json"] = "json";
})(DynamicPropertyTypes || (DynamicPropertyTypes = {}));
const fixObjectiveName = '$entity$_$storage234';
let fixObjective;
try {
    fixObjective = world.scoreboard.addObjective(fixObjectiveName);
}
catch {
    fixObjective = world.scoreboard.getObjective(fixObjectiveName);
}
const chunkAmountJSON = 10922;
class DynamicPropertyManager {
    dynamicProperties = {};
    root;
    constructor(root) {
        this.root = root;
    }
    setString(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && typeof value !== 'string')
            throw new Error('value is defined and is not of type string');
        const { type = DynamicPropertyTypes.string, gotten = false } = this.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.string)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        if (!isDefined(value))
            return this.removeString(key);
        let cancel = false;
        cancel = customEvents.stringDynamicPropertyChanged.runEvent(this.root, key, this.getString(key), value).cancel;
        cancel = customEvents.storageChanged.runEvent(this.root, key, StorageChangedType.String, this.getString(key), value).cancel;
        if (cancel)
            return;
        this.dynamicProperties[key] ??= {};
        this.dynamicProperties[key].type = DynamicPropertyTypes.string;
        this.dynamicProperties[key].value = value;
        this.dynamicProperties[key].gotten = true;
        this.root.setDynamicProperty(key, value);
    }
    getString(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.string, gotten = false } = this.dynamicProperties[key] ?? {};
        this.dynamicProperties[key] ??= {};
        if (type !== DynamicPropertyTypes.string)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        if (!gotten) {
            this.dynamicProperties[key].gotten = true;
            this.dynamicProperties[key].value = this.root.getDynamicProperty(key);
            this.dynamicProperties[key].type = DynamicPropertyTypes.string;
        }
        return this.dynamicProperties[key]?.value;
    }
    setJSON(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.json, gotten = false } = this.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.json)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        if (!isDefined(value))
            return this.removeJSON(key);
        let cancel = false;
        cancel = customEvents.jsonDynamicPropertyChanged.runEvent(this.root, key, this.getJSON(key), value).cancel;
        cancel = customEvents.storageChanged.runEvent(this.root, key, StorageChangedType.JSON, this.getJSON(key), value).cancel;
        if (cancel)
            return;
        this.dynamicProperties[key] ??= {};
        this.dynamicProperties[key].type = DynamicPropertyTypes.json;
        this.dynamicProperties[key].value = value;
        this.dynamicProperties[key].gotten = true;
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
    getJSON(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.json, gotten = false } = this.dynamicProperties[key] ?? {};
        this.dynamicProperties[key] ??= {};
        if (type !== DynamicPropertyTypes.json)
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
            this.dynamicProperties[key].type = DynamicPropertyTypes.json;
        }
        return this.dynamicProperties[key]?.value;
    }
    setNumber(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && typeof value !== 'number')
            throw new Error('value is defined and is not of type number');
        const { type = DynamicPropertyTypes.number, gotten = false } = this.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.number)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        if (!isDefined(value))
            return this.removeNumber(key);
        let cancel = false;
        cancel = customEvents.numberDynamicPropertyChanged.runEvent(this.root, key, this.getNumber(key), value).cancel;
        cancel = customEvents.storageChanged.runEvent(this.root, key, StorageChangedType.Number, this.getNumber(key), value).cancel;
        if (cancel)
            return;
        this.dynamicProperties[key] ??= {};
        this.dynamicProperties[key].type = DynamicPropertyTypes.number;
        this.dynamicProperties[key].value = value;
        this.dynamicProperties[key].gotten = true;
        this.root.setDynamicProperty(key, value);
    }
    getNumber(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.number, gotten = false } = this.dynamicProperties[key] ?? {};
        this.dynamicProperties[key] ??= {};
        if (type !== DynamicPropertyTypes.number)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        if (!gotten) {
            this.dynamicProperties[key].gotten = true;
            this.dynamicProperties[key].value = this.root.getDynamicProperty(key);
            this.dynamicProperties[key].type = DynamicPropertyTypes.number;
        }
        return this.dynamicProperties[key]?.value;
    }
    setBoolean(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && typeof value !== 'boolean')
            throw new Error('value is defined and is not of type boolean');
        const { type = DynamicPropertyTypes.boolean, gotten = false } = this.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.boolean)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        if (!isDefined(value))
            return this.removeBoolean(key);
        let cancel = false;
        cancel = customEvents.booleanDynamicPropertyChanged.runEvent(this.root, key, this.getBoolean(key), value).cancel;
        cancel = customEvents.storageChanged.runEvent(this.root, key, StorageChangedType.Boolean, this.getBoolean(key), value).cancel;
        if (cancel)
            return;
        this.dynamicProperties[key] ??= {};
        this.dynamicProperties[key].type = DynamicPropertyTypes.boolean;
        this.dynamicProperties[key].value = value;
        this.dynamicProperties[key].gotten = true;
        this.root.setDynamicProperty(key, value);
    }
    getBoolean(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.boolean, gotten = false } = this.dynamicProperties[key] ?? {};
        this.dynamicProperties[key] ??= {};
        if (type !== DynamicPropertyTypes.boolean)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        if (!gotten) {
            this.dynamicProperties[key].gotten = true;
            this.dynamicProperties[key].value = this.root.getDynamicProperty(key);
            this.dynamicProperties[key].type = DynamicPropertyTypes.boolean;
        }
        return this.dynamicProperties[key]?.value;
    }
    setVector3(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && !(isVector3(value)))
            throw new Error('value is defined and is not of type Vector3');
        const { type = DynamicPropertyTypes.vector3, gotten = false } = this.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.vector3)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        if (!isDefined(value))
            return this.removeVector3(key);
        let cancel = false;
        cancel = customEvents.vector3DynamicPropertyChanged.runEvent(this.root, key, this.getVector3(key), value).cancel;
        cancel = customEvents.storageChanged.runEvent(this.root, key, StorageChangedType.Vector3, this.getVector3(key), value).cancel;
        if (cancel)
            return;
        this.dynamicProperties[key] ??= {};
        this.dynamicProperties[key].type = DynamicPropertyTypes.vector3;
        this.dynamicProperties[key].value = value;
        this.dynamicProperties[key].gotten = true;
        this.root.setDynamicProperty(key, value);
    }
    getVector3(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.vector3, gotten = false } = this.dynamicProperties[key] ?? {};
        this.dynamicProperties[key] ??= {};
        if (type !== DynamicPropertyTypes.vector3)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        if (!gotten) {
            this.dynamicProperties[key].gotten = true;
            this.dynamicProperties[key].value = this.root.getDynamicProperty(key);
            this.dynamicProperties[key].type = DynamicPropertyTypes.vector3;
        }
        return this.dynamicProperties[key]?.value;
    }
    removeString(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.string, gotten = false } = this.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.string)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        let cancel = false;
        cancel = customEvents.stringDynamicPropertyChanged.runEvent(this.root, key, this.getString(key), undefined).cancel;
        cancel = customEvents.storageChanged.runEvent(this.root, key, StorageChangedType.String, this.getString(key), undefined).cancel;
        if (cancel)
            return;
        this.root.setDynamicProperty(key);
        this.dynamicProperties[key] ??= {};
        this.dynamicProperties[key].type = DynamicPropertyTypes.string;
        this.dynamicProperties[key].gotten = true;
        delete this.dynamicProperties[key].value;
    }
    removeJSON(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.json, gotten = false } = this.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.json)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        let cancel = false;
        cancel = customEvents.jsonDynamicPropertyChanged.runEvent(this.root, key, this.getJSON(key), undefined).cancel;
        cancel = customEvents.storageChanged.runEvent(this.root, key, StorageChangedType.JSON, this.getJSON(key), undefined).cancel;
        if (cancel)
            return;
        this.dynamicProperties[key] ??= {};
        this.dynamicProperties[key].type = DynamicPropertyTypes.json;
        this.dynamicProperties[key].gotten = true;
        delete this.dynamicProperties[key].value;
        const previousChunks = (this.root.getDynamicProperty(`${key}_chunks`) ?? 0);
        for (let i = 0; i < previousChunks; i++) {
            this.root.setDynamicProperty(`${key}_${i}`, undefined);
        }
    }
    removeNumber(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.number, gotten = false } = this.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.number)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        let cancel = false;
        cancel = customEvents.numberDynamicPropertyChanged.runEvent(this.root, key, this.getNumber(key), undefined).cancel;
        cancel = customEvents.storageChanged.runEvent(this.root, key, StorageChangedType.Number, this.getNumber(key), undefined).cancel;
        if (cancel)
            return;
        this.root.setDynamicProperty(key);
        this.dynamicProperties[key] ??= {};
        this.dynamicProperties[key].type = DynamicPropertyTypes.number;
        this.dynamicProperties[key].gotten = true;
        delete this.dynamicProperties[key].value;
    }
    removeBoolean(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.boolean, gotten = false } = this.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.boolean)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        let cancel = false;
        cancel = customEvents.booleanDynamicPropertyChanged.runEvent(this.root, key, this.getBoolean(key), undefined).cancel;
        cancel = customEvents.storageChanged.runEvent(this.root, key, StorageChangedType.Boolean, this.getBoolean(key), undefined).cancel;
        if (cancel)
            return;
        this.root.setDynamicProperty(key);
        this.dynamicProperties[key] ??= {};
        this.dynamicProperties[key].type = DynamicPropertyTypes.boolean;
        this.dynamicProperties[key].gotten = true;
        delete this.dynamicProperties[key].value;
    }
    removeVector3(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.vector3, gotten = false } = this.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.vector3)
            throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
        let cancel = false;
        cancel = customEvents.vector3DynamicPropertyChanged.runEvent(this.root, key, this.getVector3(key), undefined).cancel;
        cancel = customEvents.storageChanged.runEvent(this.root, key, StorageChangedType.Vector3, this.getVector3(key), undefined).cancel;
        if (cancel)
            return;
        this.root.setDynamicProperty(key);
        this.dynamicProperties[key] ??= {};
        this.dynamicProperties[key].type = DynamicPropertyTypes.vector3;
        this.dynamicProperties[key].gotten = true;
        delete this.dynamicProperties[key].value;
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
                case DynamicPropertyTypes.string:
                    previousValue = this.getString(key);
                    cancel = customEvents.stringDynamicPropertyChanged.runEvent(this.root, key, previousValue, undefined).cancel;
                    type = StorageChangedType.String;
                    break;
                case DynamicPropertyTypes.number:
                    previousValue = this.getNumber(key);
                    cancel = customEvents.numberDynamicPropertyChanged.runEvent(this.root, key, previousValue, undefined).cancel;
                    type = StorageChangedType.Number;
                    break;
                case DynamicPropertyTypes.boolean:
                    previousValue = this.getBoolean(key);
                    cancel = customEvents.booleanDynamicPropertyChanged.runEvent(this.root, key, previousValue, undefined).cancel;
                    type = StorageChangedType.Boolean;
                    break;
                case DynamicPropertyTypes.vector3:
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
            if (!this.root.scoreboardIdentity)
                fixObjective.setScore(this.root, 0);
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
//# sourceMappingURL=properties.js.map