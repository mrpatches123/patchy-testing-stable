import { Entity, Player, Scoreboard, ScoreboardObjective, Vector3, World, world } from "@minecraft/server";
import { isDefined, isVector3 } from "./utilities";
export class Storage {
	protected managers: Record<string, EntityStorageManager | WorldStorageManager> = { 'world': new WorldStorageManager(world) };
	get(): WorldStorageManager;
	get(target: World): WorldStorageManager;
	get(target: Entity): EntityStorageManager;
	get(target: Player): EntityStorageManager;
	get<T extends Entity | Player | World | undefined | void>(target?: T): T extends Player | Entity ? EntityStorageManager : WorldStorageManager {
		if (!target) return this.managers['world'] as any;
		if (target instanceof World) return this.managers['world'] as any;
		const { id } = target;
		this.managers[id] ??= new EntityStorageManager(target);
		return this.managers[id] as any;
	}
}
enum DynamicPropertyTypes {
	string = 'string',
	number = 'number',
	boolean = 'boolean',
	vector3 = 'vector3',
}
const fixObjectiveName = '$entity$_$storage234';
let fixObjective: ScoreboardObjective;
try {
	fixObjective = world.scoreboard.addObjective(fixObjectiveName);
} catch {
	fixObjective = world.scoreboard.getObjective(fixObjectiveName)!;
}
class DynamicPropertyManager {
	dynamicProperties: Record<string, { type?: DynamicPropertyTypes, value?: number | boolean | Vector3 | string; gotten?: boolean; }> = {};
	protected root: Player | Entity | World;
	constructor(root: Player | Entity | World) {
		this.root = root;
	}
	setString(key: string, value?: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		if (isDefined(value) && typeof value !== 'string') throw new Error('value is defined and is not of type string');
		if (!isDefined(value)) return this.removeString(key);
		const { type = DynamicPropertyTypes.string, gotten = false } = this.dynamicProperties[key] ?? {};
		if (type !== DynamicPropertyTypes.string) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		this.dynamicProperties[key] ??= {};
		this.dynamicProperties[key].type = DynamicPropertyTypes.string;
		this.dynamicProperties[key].value = value;
		this.dynamicProperties[key].gotten = true;
		this.root.setDynamicProperty(key, value);
	}
	getString(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const { type = DynamicPropertyTypes.string, gotten = false } = this.dynamicProperties[key] ?? {};
		this.dynamicProperties[key] ??= {};
		if (type !== DynamicPropertyTypes.string) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		if (!gotten) {
			this.dynamicProperties[key].gotten = true;
			this.dynamicProperties[key].value = this.root.getDynamicProperty(key) as string;
			this.dynamicProperties[key].type = DynamicPropertyTypes.string;
		}
		return this.dynamicProperties[key]?.value;
	}
	setNumber(key: string, value?: number) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		if (isDefined(value) && typeof value !== 'number') throw new Error('value is defined and is not of type number');
		if (!isDefined(value)) return this.removeNumber(key);
		const { type = DynamicPropertyTypes.number, gotten = false } = this.dynamicProperties[key] ?? {};
		if (type !== DynamicPropertyTypes.number) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		this.dynamicProperties[key] ??= {};
		this.dynamicProperties[key].type = DynamicPropertyTypes.number;
		this.dynamicProperties[key].value = value;
		this.dynamicProperties[key].gotten = true;
		this.root.setDynamicProperty(key, value);

	}
	getNumber(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const { type = DynamicPropertyTypes.number, gotten = false } = this.dynamicProperties[key] ?? {};
		this.dynamicProperties[key] ??= {};
		if (type !== DynamicPropertyTypes.number) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		if (!gotten) {
			this.dynamicProperties[key].gotten = true;
			this.dynamicProperties[key].value = this.root.getDynamicProperty(key) as number;
			this.dynamicProperties[key].type = DynamicPropertyTypes.number;
		}
		return this.dynamicProperties[key]?.value;
	}
	setBoolean(key: string, value?: boolean) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		if (isDefined(value) && typeof value !== 'boolean') throw new Error('value is defined and is not of type boolean');
		if (!isDefined(value)) return this.removeBoolean(key);
		const { type = DynamicPropertyTypes.boolean, gotten = false } = this.dynamicProperties[key] ?? {};
		if (type !== DynamicPropertyTypes.boolean) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		this.dynamicProperties[key] ??= {};
		this.dynamicProperties[key].type = DynamicPropertyTypes.boolean;
		this.dynamicProperties[key].value = value;
		this.dynamicProperties[key].gotten = true;
		this.root.setDynamicProperty(key, value);
	}
	getBoolean(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const { type = DynamicPropertyTypes.boolean, gotten = false } = this.dynamicProperties[key] ?? {};
		this.dynamicProperties[key] ??= {};
		if (type !== DynamicPropertyTypes.boolean) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		if (!gotten) {
			this.dynamicProperties[key].gotten = true;
			this.dynamicProperties[key].value = this.root.getDynamicProperty(key) as boolean;
			this.dynamicProperties[key].type = DynamicPropertyTypes.boolean;
		}
		return this.dynamicProperties[key]?.value;
	}
	setVector3(key: string, value?: Vector3) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		if (isDefined(value) && !(isVector3(value))) throw new Error('value is defined and is not of type Vector3');
		if (!isDefined(value)) return this.removeVector3(key);
		const { type = DynamicPropertyTypes.vector3, gotten = false } = this.dynamicProperties[key] ?? {};
		if (type !== DynamicPropertyTypes.vector3) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		this.dynamicProperties[key] ??= {};
		this.dynamicProperties[key].type = DynamicPropertyTypes.vector3;
		this.dynamicProperties[key].value = value;
		this.dynamicProperties[key].gotten = true;
		this.root.setDynamicProperty(key, value);
	}
	getVector3(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const { type = DynamicPropertyTypes.vector3, gotten = false } = this.dynamicProperties[key] ?? {};
		this.dynamicProperties[key] ??= {};
		if (type !== DynamicPropertyTypes.vector3) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		if (!gotten) {
			this.dynamicProperties[key].gotten = true;
			this.dynamicProperties[key].value = this.root.getDynamicProperty(key) as Vector3;
			this.dynamicProperties[key].type = DynamicPropertyTypes.vector3;
		}
		return this.dynamicProperties[key]?.value;
	}
	removeString(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const { type = DynamicPropertyTypes.string, gotten = false } = this.dynamicProperties[key] ?? {};
		if (type !== DynamicPropertyTypes.string) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		this.root.setDynamicProperty(key);
		this.dynamicProperties[key] ??= {};
		this.dynamicProperties[key].type = DynamicPropertyTypes.string;
		this.dynamicProperties[key].gotten = true;
		delete this.dynamicProperties[key].value;

	}
	removeNumber(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const { type = DynamicPropertyTypes.number, gotten = false } = this.dynamicProperties[key] ?? {};
		if (type !== DynamicPropertyTypes.number) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		this.root.setDynamicProperty(key);
		this.dynamicProperties[key] ??= {};
		this.dynamicProperties[key].type = DynamicPropertyTypes.number;
		this.dynamicProperties[key].gotten = true;
		delete this.dynamicProperties[key].value;
	}
	removeBoolean(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const { type = DynamicPropertyTypes.boolean, gotten = false } = this.dynamicProperties[key] ?? {};
		if (type !== DynamicPropertyTypes.boolean) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		this.root.setDynamicProperty(key);
		this.dynamicProperties[key] ??= {};
		this.dynamicProperties[key].type = DynamicPropertyTypes.boolean;
		this.dynamicProperties[key].gotten = true;
		delete this.dynamicProperties[key].value;
	}
	removeVector3(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const { type = DynamicPropertyTypes.vector3, gotten = false } = this.dynamicProperties[key] ?? {};
		if (type !== DynamicPropertyTypes.vector3) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		this.root.setDynamicProperty(key);
		this.dynamicProperties[key] ??= {};
		this.dynamicProperties[key].type = DynamicPropertyTypes.vector3;
		this.dynamicProperties[key].gotten = true;
		delete this.dynamicProperties[key].value;
	}
	clearAllDynamicProperties() {
		this.root.clearDynamicProperties();
		this.dynamicProperties = {};
	}
	get strings(): Record<string, string | undefined> {
		const thisEntityStorage = this;
		return new Proxy({}, {
			set: (target, key, value, receiver) => {
				thisEntityStorage.setString(key as string, value);
				return Reflect.set(target, key, value, receiver);
			},
			get: (target, key, receiver) => {
				return thisEntityStorage.getString(key as string);
			}
		});
	}
	get numbers(): Record<string, number | undefined> {
		const thisEntityStorage = this;
		return new Proxy({}, {
			set: (target, key, value, receiver) => {
				thisEntityStorage.setNumber(key as string, value);
				return Reflect.set(target, key, value, receiver);
			},
			get: (target, key, receiver) => {
				return thisEntityStorage.getNumber(key as string);
			}
		});
	}
	get booleans(): Record<string, boolean | undefined> {
		const thisEntityStorage = this;
		return new Proxy({}, {
			set: (target, key, value, receiver) => {
				thisEntityStorage.setBoolean(key as string, value);
				return Reflect.set(target, key, value, receiver);
			},
			get: (target, key, receiver) => {
				return thisEntityStorage.getBoolean(key as string);
			}
		});
	}
	get vector3s(): Record<string, Vector3 | undefined> {
		const thisEntityStorage = this;
		return new Proxy({}, {
			set: (target, key, value, receiver) => {
				thisEntityStorage.setVector3(key as string, value);
				return Reflect.set(target, key, value, receiver);
			},
			get: (target, key, receiver) => {
				return thisEntityStorage.getVector3(key as string);
			}
		});
	}
}
class EntityStorageManager extends DynamicPropertyManager {

	setScore(key: string, value?: number) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		if (isDefined(value) && typeof value !== 'number') throw new Error('value is defined and is not of type number');
		if (!isDefined(value)) return this.removeScore(key);
		this.scoresStorage[key] ??= {};
		let { objective } = this.scoresStorage[key];
		if (!objective) {
			objective = world.scoreboard.getObjective(key);
			this.scoresStorage[key].objective ??= objective;
			if (!objective) throw new Error(`objective doesn't exist: ${key}`);
		}
		this.scoresStorage[key] ??= {};
		this.scoresStorage[key].value = value;
		this.scoresStorage[key].gotten = true;
		if (!isDefined(value)) return objective.removeParticipant(this.root);
		objective.setScore(this.root, value);
	}
	getScore(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		this.scoresStorage[key] ??= {};
		if (!this.scoresStorage[key]?.gotten) {
			let { objective } = this.scoresStorage[key] ?? {};
			if (!objective) {
				objective = world.scoreboard.getObjective(key);
				this.scoresStorage[key].objective ??= objective;
				if (!objective) throw new Error(`objective doesn't exist: ${key}`);
			}
			this.scoresStorage[key].gotten = true;
			if (!this.root.scoreboardIdentity) fixObjective.setScore(this.root, 0);
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

	removeScore(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const objective = this.scoresStorage[key]?.objective ?? world.scoreboard.getObjective(key);
		objective?.removeParticipant(this.root);
		this.scoresStorage[key].gotten = true;
		delete this.scoresStorage[key].value;
	}

	protected root: Player | Entity;
	constructor(root: Player | Entity) {
		super(root);
		this.root = root;
	}
	protected scoresStorage: Record<string, { objective?: ScoreboardObjective, value?: number; gotten?: boolean; }> = {};

	get scores(): Record<string, number | undefined> {
		const thisEntityStorage = this;
		return new Proxy({}, {
			set: (target, key, value, receiver) => {
				thisEntityStorage.setScore(key as string, value);
				return Reflect.set(target, key, value, receiver);
			},
			get: (target, key, receiver) => {
				return thisEntityStorage.getScore(key as string);
			}
		});
	}

}
class WorldStorageManager extends DynamicPropertyManager {
	protected root: World;
	protected scoresStorage: Record<string, Record<string, { objective?: ScoreboardObjective, value?: number; gotten?: boolean; }>> = {};
	constructor(root: World) {
		super(root);
		this.root = root;
	}
	setScore(key: string, dummyName: string, value?: number) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		if (isDefined(value) && typeof value !== 'number') throw new Error('value is defined and is not of type number');
		this.scoresStorage[key] ??= {};
		this.scoresStorage[key][dummyName] ??= {};
		let { objective } = this.scoresStorage[key]?.[dummyName] ?? {};
		this.scoresStorage[key] ??= {};
		this.scoresStorage[key][dummyName] ?? {};
		if (!objective) {
			objective = world.scoreboard.getObjective(key);
			this.scoresStorage[key][dummyName].objective ??= objective;
			if (!objective) throw new Error(`objective doesn't exist: ${key}`);
		}
		this.scoresStorage[key][dummyName].value = value;
		this.scoresStorage[key][dummyName].gotten = true;
		if (!isDefined(value)) return objective.removeParticipant(key);
		objective.setScore(dummyName, value);
	}
	getScore(key: string, dummyName: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		this.scoresStorage[key] ??= {};
		this.scoresStorage[key][dummyName] ??= {};
		if (!this.scoresStorage[key]?.gotten) {
			let { objective } = this.scoresStorage[key]?.[dummyName] ?? {};
			if (!objective) {
				objective = world.scoreboard.getObjective(key);
				this.scoresStorage[key][dummyName].objective ??= objective;
				if (!objective) throw new Error(`objective doesn't exist: ${key}`);
			}

			if (!this.scoresStorage[key][dummyName].gotten) {
				this.scoresStorage[key][dummyName].gotten = true;
				this.scoresStorage[key][dummyName].value = objective.getScore(dummyName);
			}

		}
		return this.scoresStorage[key]?.[dummyName]?.value;
	}
	removeScore(key: string, dummyName: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const objective = this.scoresStorage[key]?.[dummyName]?.objective ?? world.scoreboard.getObjective(key);
		objective?.removeParticipant(dummyName);
		this.scoresStorage[key] ??= {};
		this.scoresStorage[key][dummyName].gotten = true;
		delete this.scoresStorage[key][dummyName].value;
	}
	get scores(): Record<string, Record<string, number | undefined>> {
		const thisEntityStorage = this;
		return new Proxy({}, {
			get: (target, key, receiver) => {
				return new Proxy({}, {
					set: (target, dummyName, value, receiver) => {
						thisEntityStorage.setScore(key as string, dummyName as string, value);
						return Reflect.set(target, key, value, receiver);
					},
					get: (target, dummyName, receiver) => {
						return thisEntityStorage.getScore(key as string, dummyName as string);
					}
				});
			}
		});
	}
};

export const storage = new Storage();