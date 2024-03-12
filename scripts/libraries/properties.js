import { World, world } from "@minecraft/server";
import { isDefined, isVector3 } from "./utilities";
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
}
var DynamicPropertyTypes;
(function (DynamicPropertyTypes) {
    DynamicPropertyTypes["string"] = "string";
    DynamicPropertyTypes["number"] = "number";
    DynamicPropertyTypes["boolean"] = "boolean";
    DynamicPropertyTypes["vector3"] = "vector3";
})(DynamicPropertyTypes || (DynamicPropertyTypes = {}));
const fixObjectiveName = '$entity$_$storage234';
let fixObjective;
try {
    fixObjective = world.scoreboard.addObjective(fixObjectiveName);
}
catch {
    fixObjective = world.scoreboard.getObjective(fixObjectiveName);
}
class EntityStorageManager {
    constructor(root) {
        this.root = root;
    }
    setScore(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && typeof value !== 'number')
            throw new Error('value is defined and is not of type number');
        if (!isDefined(value))
            return this.removeScore(key);
        this.storage.scores[key] ??= {};
        let { objective } = this.storage.scores[key];
        if (!objective) {
            objective = world.scoreboard.getObjective(key);
            this.storage.scores[key].objective ??= objective;
            if (!objective)
                throw new Error(`objective doesn't exist: ${key}`);
        }
        this.storage.scores[key] ??= {};
        this.storage.scores[key].value = value;
        this.storage.scores[key].gotten = true;
        if (!isDefined(value))
            return objective.removeParticipant(this.root);
        objective.setScore(this.root, value);
    }
    getScore(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        this.storage.scores[key] ??= {};
        if (!this.storage.scores[key]?.gotten) {
            let { objective } = this.storage.scores[key] ?? {};
            if (!objective) {
                objective = world.scoreboard.getObjective(key);
                this.storage.scores[key].objective ??= objective;
                if (!objective)
                    throw new Error(`objective doesn't exist: ${key}`);
            }
            this.storage.scores[key].gotten = true;
            if (!this.root.scoreboardIdentity)
                fixObjective.setScore(this.root, 0);
            this.storage.scores[key].value = objective.getScore(this.root);
        }
        return this.storage.scores[key]?.value;
    }
    setString(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && typeof value !== 'string')
            throw new Error('value is defined and is not of type string');
        if (!isDefined(value))
            return this.removeString(key);
        const { type = DynamicPropertyTypes.string, gotten = false } = this.storage.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.string)
            throw new Error(`key is assigned to type: ${this.storage.dynamicProperties[key]?.type}`);
        this.storage.dynamicProperties[key] ??= {};
        this.storage.dynamicProperties[key].type = DynamicPropertyTypes.string;
        this.storage.dynamicProperties[key].value = value;
        this.storage.dynamicProperties[key].gotten = true;
        this.root.setDynamicProperty(key, value);
    }
    getString(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.string, gotten = false } = this.storage.dynamicProperties[key] ?? {};
        this.storage.dynamicProperties[key] ??= {};
        if (type !== DynamicPropertyTypes.string)
            throw new Error(`key is assigned to type: ${this.storage.dynamicProperties[key]?.type}`);
        if (!gotten) {
            this.storage.dynamicProperties[key].gotten = true;
            this.storage.dynamicProperties[key].value = this.root.getDynamicProperty(key);
            this.storage.dynamicProperties[key].type = DynamicPropertyTypes.string;
        }
        return this.storage.dynamicProperties[key]?.value;
    }
    setNumber(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && typeof value !== 'number')
            throw new Error('value is defined and is not of type number');
        if (!isDefined(value))
            return this.removeNumber(key);
        const { type = DynamicPropertyTypes.number, gotten = false } = this.storage.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.number)
            throw new Error(`key is assigned to type: ${this.storage.dynamicProperties[key]?.type}`);
        this.storage.dynamicProperties[key] ??= {};
        this.storage.dynamicProperties[key].type = DynamicPropertyTypes.number;
        this.storage.dynamicProperties[key].value = value;
        this.storage.dynamicProperties[key].gotten = true;
        this.root.setDynamicProperty(key, value);
    }
    getNumber(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.number, gotten = false } = this.storage.dynamicProperties[key] ?? {};
        this.storage.dynamicProperties[key] ??= {};
        if (type !== DynamicPropertyTypes.number)
            throw new Error(`key is assigned to type: ${this.storage.dynamicProperties[key]?.type}`);
        if (!gotten) {
            this.storage.dynamicProperties[key].gotten = true;
            this.storage.dynamicProperties[key].value = this.root.getDynamicProperty(key);
            this.storage.dynamicProperties[key].type = DynamicPropertyTypes.number;
        }
        return this.storage.dynamicProperties[key]?.value;
    }
    setBoolean(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && typeof value !== 'boolean')
            throw new Error('value is defined and is not of type boolean');
        if (!isDefined(value))
            return this.removeBoolean(key);
        const { type = DynamicPropertyTypes.boolean, gotten = false } = this.storage.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.boolean)
            throw new Error(`key is assigned to type: ${this.storage.dynamicProperties[key]?.type}`);
        this.storage.dynamicProperties[key] ??= {};
        this.storage.dynamicProperties[key].type = DynamicPropertyTypes.boolean;
        this.storage.dynamicProperties[key].value = value;
        this.storage.dynamicProperties[key].gotten = true;
        this.root.setDynamicProperty(key, value);
    }
    getBoolean(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.boolean, gotten = false } = this.storage.dynamicProperties[key] ?? {};
        this.storage.dynamicProperties[key] ??= {};
        if (type !== DynamicPropertyTypes.boolean)
            throw new Error(`key is assigned to type: ${this.storage.dynamicProperties[key]?.type}`);
        if (!gotten) {
            this.storage.dynamicProperties[key].gotten = true;
            this.storage.dynamicProperties[key].value = this.root.getDynamicProperty(key);
            this.storage.dynamicProperties[key].type = DynamicPropertyTypes.boolean;
        }
        return this.storage.dynamicProperties[key]?.value;
    }
    setVector3(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && !(isVector3(value)))
            throw new Error('value is defined and is not of type Vector3');
        if (!isDefined(value))
            return this.removeVector3(key);
        const { type = DynamicPropertyTypes.vector3, gotten = false } = this.storage.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.vector3)
            throw new Error(`key is assigned to type: ${this.storage.dynamicProperties[key]?.type}`);
        this.storage.dynamicProperties[key] ??= {};
        this.storage.dynamicProperties[key].type = DynamicPropertyTypes.vector3;
        this.storage.dynamicProperties[key].value = value;
        this.storage.dynamicProperties[key].gotten = true;
        this.root.setDynamicProperty(key, value);
    }
    getVector3(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.vector3, gotten = false } = this.storage.dynamicProperties[key] ?? {};
        this.storage.dynamicProperties[key] ??= {};
        if (type !== DynamicPropertyTypes.vector3)
            throw new Error(`key is assigned to type: ${this.storage.dynamicProperties[key]?.type}`);
        if (!gotten) {
            this.storage.dynamicProperties[key].gotten = true;
            this.storage.dynamicProperties[key].value = this.root.getDynamicProperty(key);
            this.storage.dynamicProperties[key].type = DynamicPropertyTypes.vector3;
        }
        return this.storage.dynamicProperties[key]?.value;
    }
    clearAllDynamicProperties() {
        this.root.clearDynamicProperties();
        this.storage.dynamicProperties = {};
    }
    clearAllScores() {
        this.root.runCommand(`scoreboard players reset @s`);
        this.storage.scores = {};
    }
    clearAll() {
        this.clearAllScores();
        this.clearAllDynamicProperties();
    }
    removeString(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.string, gotten = false } = this.storage.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.string)
            throw new Error(`key is assigned to type: ${this.storage.dynamicProperties[key]?.type}`);
        this.root.setDynamicProperty(key);
        this.storage.dynamicProperties[key] ??= {};
        this.storage.dynamicProperties[key].type = DynamicPropertyTypes.string;
        this.storage.dynamicProperties[key].gotten = true;
        delete this.storage.dynamicProperties[key].value;
    }
    removeNumber(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.number, gotten = false } = this.storage.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.number)
            throw new Error(`key is assigned to type: ${this.storage.dynamicProperties[key]?.type}`);
        this.root.setDynamicProperty(key);
        this.storage.dynamicProperties[key] ??= {};
        this.storage.dynamicProperties[key].type = DynamicPropertyTypes.number;
        this.storage.dynamicProperties[key].gotten = true;
        delete this.storage.dynamicProperties[key].value;
    }
    removeBoolean(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.boolean, gotten = false } = this.storage.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.boolean)
            throw new Error(`key is assigned to type: ${this.storage.dynamicProperties[key]?.type}`);
        this.root.setDynamicProperty(key);
        this.storage.dynamicProperties[key] ??= {};
        this.storage.dynamicProperties[key].type = DynamicPropertyTypes.boolean;
        this.storage.dynamicProperties[key].gotten = true;
        delete this.storage.dynamicProperties[key].value;
    }
    removeVector3(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const { type = DynamicPropertyTypes.vector3, gotten = false } = this.storage.dynamicProperties[key] ?? {};
        if (type !== DynamicPropertyTypes.vector3)
            throw new Error(`key is assigned to type: ${this.storage.dynamicProperties[key]?.type}`);
        this.root.setDynamicProperty(key);
        this.storage.dynamicProperties[key] ??= {};
        this.storage.dynamicProperties[key].type = DynamicPropertyTypes.vector3;
        this.storage.dynamicProperties[key].gotten = true;
        delete this.storage.dynamicProperties[key].value;
    }
    removeScore(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const objective = this.storage.scores[key]?.objective ?? world.scoreboard.getObjective(key);
        objective?.removeParticipant(this.root);
        this.storage.scores[key].gotten = true;
        delete this.storage.scores[key].value;
    }
    root;
    storage = {
        scores: {},
        dynamicProperties: {},
    };
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
class WorldStorageManager {
    root;
    storage = {
        scores: {},
        numbers: {},
        booleans: {},
        strings: {},
        vector3s: {},
    };
    constructor(root) {
        this.root = root;
    }
    setScore(key, dummyName, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && typeof value !== 'number')
            throw new Error('value is defined and is not of type number');
        this.storage.scores[key] ??= {};
        this.storage.scores[key][dummyName] ??= {};
        let { objective } = this.storage.scores[key]?.[dummyName] ?? {};
        this.storage.scores[key] ??= {};
        this.storage.scores[key][dummyName] ?? {};
        if (!objective) {
            objective = world.scoreboard.getObjective(key);
            this.storage.scores[key][dummyName].objective ??= objective;
            if (!objective)
                throw new Error(`objective doesn't exist: ${key}`);
        }
        this.storage.scores[key][dummyName].value = value;
        this.storage.scores[key][dummyName].gotten = true;
        if (!isDefined(value))
            return objective.removeParticipant(key);
        objective.setScore(dummyName, value);
    }
    getScore(key, dummyName) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        this.storage.scores[key] ??= {};
        this.storage.scores[key][dummyName] ??= {};
        if (!this.storage.scores[key]?.gotten) {
            let { objective } = this.storage.scores[key]?.[dummyName] ?? {};
            if (!objective) {
                objective = world.scoreboard.getObjective(key);
                this.storage.scores[key][dummyName].objective ??= objective;
                if (!objective)
                    throw new Error(`objective doesn't exist: ${key}`);
            }
            if (!this.storage.scores[key][dummyName].gotten) {
                this.storage.scores[key][dummyName].gotten = true;
                this.storage.scores[key][dummyName].value = objective.getScore(dummyName);
            }
        }
        return this.storage.scores[key]?.[dummyName]?.value;
    }
    setString(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && typeof value !== 'string')
            throw new Error('value is defined and is not of type string');
        if (!isDefined(value))
            return this.removeString(key);
        this.storage.strings[key] ??= {};
        this.storage.strings[key].value = value;
        this.storage.strings[key].gotten = true;
        this.root.setDynamicProperty(key, value);
    }
    getString(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        this.storage.strings[key] ??= {};
        if (!this.storage.strings[key]?.gotten) {
            this.storage.strings[key] = { gotten: true, value: this.root.getDynamicProperty(key) };
        }
        return this.storage.strings[key]?.value;
    }
    setNumber(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && typeof value !== 'number')
            throw new Error('value is defined and is not of type number');
        if (!isDefined(value))
            return this.removeNumber(key);
        this.storage.numbers[key] ??= {};
        this.storage.numbers[key].value = value;
        this.storage.numbers[key].gotten = true;
        this.root.setDynamicProperty(key, value);
    }
    getNumber(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        this.storage.numbers[key] ??= {};
        if (!this.storage.numbers[key]?.gotten) {
            this.storage.numbers[key] = { gotten: true, value: this.root.getDynamicProperty(key) };
        }
        return this.storage.numbers[key]?.value;
    }
    setBoolean(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && typeof value !== 'boolean')
            throw new Error('value is defined and is not of type boolean');
        if (!isDefined(value))
            return this.removeBoolean(key);
        this.storage.booleans[key] ??= {};
        this.storage.booleans[key].value = value;
        this.storage.booleans[key].gotten = true;
        this.root.setDynamicProperty(key, value);
    }
    getBoolean(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        this.storage.booleans[key] ??= {};
        if (!this.storage.booleans[key]?.gotten) {
            this.storage.booleans[key] = { gotten: true, value: this.root.getDynamicProperty(key) };
        }
        return this.storage.booleans[key]?.value;
    }
    setVector3(key, value) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        if (isDefined(value) && !(isVector3(value)))
            throw new Error('value is defined and is not of type Vector3');
        if (!isDefined(value))
            return this.removeVector3(key);
        this.storage.vector3s[key] ??= {};
        this.storage.vector3s[key].value = value;
        this.storage.vector3s[key].gotten = true;
        this.root.setDynamicProperty(key, value);
    }
    getVector3(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        this.storage.vector3s[key] ??= {};
        if (!this.storage.vector3s[key]?.gotten) {
            this.storage.vector3s[key] = { gotten: true, value: this.root.getDynamicProperty(key) };
        }
        return this.storage.vector3s[key]?.value;
    }
    clearAllDynamicProperties() {
        this.root.clearDynamicProperties();
        this.storage.booleans = {};
        this.storage.numbers = {};
        this.storage.strings = {};
        this.storage.vector3s = {};
    }
    removeString(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        this.root.setDynamicProperty(key);
        this.storage.strings[key] ??= {};
        this.storage.strings[key].gotten = true;
        delete this.storage.strings[key].value;
    }
    removeNumber(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        this.root.setDynamicProperty(key);
        this.storage.numbers[key] ??= {};
        this.storage.numbers[key].gotten = true;
        delete this.storage.numbers[key].value;
    }
    removeBoolean(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        this.root.setDynamicProperty(key);
        this.storage.booleans[key] ??= {};
        this.storage.booleans[key].gotten = true;
        delete this.storage.booleans[key].value;
    }
    removeVector3(key) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        this.root.setDynamicProperty(key);
        this.storage.vector3s[key] ??= {};
        this.storage.vector3s[key].gotten = true;
        delete this.storage.vector3s[key].value;
    }
    removeScore(key, dummyName) {
        if (typeof key !== 'string')
            throw new Error('key is not of type string');
        const objective = this.storage.scores[key]?.[dummyName]?.objective ?? world.scoreboard.getObjective(key);
        objective?.removeParticipant(dummyName);
        this.storage.scores[key] ??= {};
        this.storage.scores[key][dummyName].gotten = true;
        delete this.storage.scores[key][dummyName].value;
    }
    get scores() {
        const thisEntityStorage = this;
        return new Proxy({}, {
            get: (target, key, receiver) => {
                return new Proxy({}, {
                    get: (target, dummyName, receiver) => {
                        return thisEntityStorage.getScore(key, dummyName);
                    },
                    set: (target, dummyName, value, receiver) => {
                        thisEntityStorage.setScore(key, dummyName, value);
                        return Reflect.set(target, dummyName, value, receiver);
                    }
                });
            }
        });
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
;
export const storage = new Storage();
