import { Entity, Player, Scoreboard, ScoreboardObjective, Vector3, World, world } from "@minecraft/server";
import { chunkString, isDefined, isVector3 } from "./utilities";
import { customEvents } from "./events";
import { worldInitialize } from "./events/world_initialize";
import { StorageChangedEventTemplate } from "./events/storage_changed_template";
import { StorageChangedType } from "./events/storage_changed";

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
	constructor() {
		world.afterEvents.playerLeave.subscribe(({ playerId }) => {
			delete this.managers[playerId];
		});
		world.afterEvents.entityRemove.subscribe(({ removedEntityId }) => {
			delete this.managers[removedEntityId];
		});
		world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
			if (deadEntity instanceof Player) return;
			delete this.managers[deadEntity.id];
		});
	}
}
export enum DynamicPropertyTypes {
	String = 'string',
	Number = 'number',
	Boolean = 'boolean',
	Vector3 = 'vector3',
	JSON = 'json',
}
const fixObjectiveName = '$entity$_$storage234';
let fixObjective: ScoreboardObjective | undefined;
customEvents.worldInitialize.subscribe(() => {
	try {
		fixObjective = world.scoreboard.addObjective(fixObjectiveName);
	} catch {
		fixObjective = world.scoreboard.getObjective(fixObjectiveName)!;
	}
});
const chunkAmountJSON = 10922;
class DynamicPropertyManager {
	dynamicProperties: Record<string, { type?: DynamicPropertyTypes, value?: number | boolean | Vector3 | string | any; gotten?: boolean; }> = {};
	protected root: Player | Entity | World;
	constructor(root: Player | Entity | World) {
		this.root = root;
	}
	private setInternal<t extends string | number | boolean | Vector3 | any>(key: string, value: t | undefined, data: {
		type: DynamicPropertyTypes,
		specificEvent: StorageChangedEventTemplate,
		getFunction: (key: string) => t | undefined,
		removeFunction: (key: string) => void;
		typeCheck: (value: t) => boolean;
		setFunction: (key: string, value: t) => void;
	}) {
		const { type, specificEvent, removeFunction, getFunction, typeCheck, setFunction } = data;
		if (typeof key !== "string") throw new Error(`key is not of type string`);
		if (isDefined(value) && !typeCheck(value)) throw new Error(`value is defined and is not of type: ${type}`);
		const { type: typeCached = type, gotten = false } = this.dynamicProperties[key] ?? {};
		if (typeCached !== type) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		let cancel: Boolean, cancelCache: Boolean, cancelSet: Boolean = false;
		if (!isDefined(value)) return removeFunction(key);
		const gottenValue = <any>getFunction(key);
		const { cancel: cancelSpecific, cancelCache: cancelCacheSpecific, cancelSet: cancelSetSpecific } = specificEvent.runEvent(this.root, key, gottenValue, <any>value);
		const { cancel: cancelStorage, cancelCache: cancelCacheStorage, cancelSet: cancelSetStorage } = customEvents.storageChanged.runEvent(this.root, key, type, gottenValue, <any>value);
		cancel = cancelSpecific || cancelStorage;
		cancelCache = cancelCacheSpecific || cancelCacheStorage;
		cancelSet = cancelSetSpecific || cancelSetStorage;
		if (cancel) return;
		if (!cancelCache) {
			this.dynamicProperties[key] ??= {};
			this.dynamicProperties[key].type = type;
			this.dynamicProperties[key].value = value;
			this.dynamicProperties[key].gotten = true;
		}
		if (cancelSet) return;
		setFunction(key, value);
	}
	setString(key: string, value?: string) {
		this.setInternal(key, value ?? undefined, {
			getFunction: this.getString.bind(this),
			specificEvent: customEvents.stringDynamicPropertyChanged,
			removeFunction: this.removeString.bind(this),
			type: DynamicPropertyTypes.String,
			typeCheck: (value) => typeof value === "string",
			setFunction: this.root.setDynamicProperty.bind(this.root)
		});
	}
	getString(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const { type = DynamicPropertyTypes.String, gotten = false } = this.dynamicProperties[key] ?? {};
		this.dynamicProperties[key] ??= {};
		if (type !== DynamicPropertyTypes.String) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		if (!gotten) {
			this.dynamicProperties[key].gotten = true;
			this.dynamicProperties[key].value = this.root.getDynamicProperty(key) as string;
			this.dynamicProperties[key].type = DynamicPropertyTypes.String;
		}
		return this.dynamicProperties[key]?.value as string | undefined;
	}
	setJSON(key: string, value?: any) {

		this.setInternal(key, value ?? undefined, {
			getFunction: this.getJSON.bind(this),
			specificEvent: customEvents.jsonDynamicPropertyChanged,
			removeFunction: this.removeJSON.bind(this),
			type: DynamicPropertyTypes.JSON,
			typeCheck: (value) => true,
			setFunction: (key, value) => {
				const stringValue = JSON.stringify(value);
				const chunks = chunkString(stringValue, chunkAmountJSON);
				const previousChunks = (this.root.getDynamicProperty(`${key}_chunks`) ?? 0) as number;
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
	getJSON(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const { type = DynamicPropertyTypes.JSON, gotten = false } = this.dynamicProperties[key] ?? {};
		this.dynamicProperties[key] ??= {};
		if (type !== DynamicPropertyTypes.JSON) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		if (!gotten) {
			const chunks = Array.from({ length: (this.root.getDynamicProperty(`${key}_chunks`) ?? 0) as number }, (_, index) => this.root.getDynamicProperty(`${key}_${index}`) as string);
			this.dynamicProperties[key].gotten = true;
			try {
				this.dynamicProperties[key].value = JSON.parse(chunks.join(''));
			} catch (error: any) {
				// console.warn(`Error parsing JSON for key: ${key}, ${error.stack}`);
				this.dynamicProperties[key].value = undefined;
			}
			this.dynamicProperties[key].type = DynamicPropertyTypes.JSON;
		}
		return this.dynamicProperties[key]?.value as any | undefined;
	}
	setNumber(key: string, value?: number) {

		this.setInternal(key, value ?? undefined, {
			getFunction: this.getNumber.bind(this),
			specificEvent: customEvents.numberDynamicPropertyChanged,
			removeFunction: this.removeNumber.bind(this),
			type: DynamicPropertyTypes.Number,
			typeCheck: (value) => typeof value === "number",
			setFunction: this.root.setDynamicProperty.bind(this.root)
		});

	}
	getNumber(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const { type = DynamicPropertyTypes.Number, gotten = false } = this.dynamicProperties[key] ?? {};
		this.dynamicProperties[key] ??= {};
		if (type !== DynamicPropertyTypes.Number) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		if (!gotten) {
			this.dynamicProperties[key].gotten = true;
			this.dynamicProperties[key].value = this.root.getDynamicProperty(key) as number;
			this.dynamicProperties[key].type = DynamicPropertyTypes.Number;
		}
		return this.dynamicProperties[key]?.value as number | undefined;
	}
	setBoolean(key: string, value?: boolean) {
		this.setInternal(key, value ?? undefined, {
			getFunction: this.getBoolean.bind(this),
			specificEvent: customEvents.booleanDynamicPropertyChanged,
			removeFunction: this.removeBoolean.bind(this),
			type: DynamicPropertyTypes.Boolean,
			typeCheck: (value) => typeof value === "boolean",
			setFunction: this.root.setDynamicProperty.bind(this.root)
		});
	}
	getBoolean(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const { type = DynamicPropertyTypes.Boolean, gotten = false } = this.dynamicProperties[key] ?? {};
		this.dynamicProperties[key] ??= {};
		if (type !== DynamicPropertyTypes.Boolean) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		if (!gotten) {
			this.dynamicProperties[key].gotten = true;
			this.dynamicProperties[key].value = this.root.getDynamicProperty(key) as boolean;
			this.dynamicProperties[key].type = DynamicPropertyTypes.Boolean;
		}
		return this.dynamicProperties[key]?.value as boolean | undefined;
	}
	setVector3(key: string, value?: Vector3) {
		this.setInternal(key, value ?? undefined, {
			getFunction: this.getVector3.bind(this),
			specificEvent: customEvents.vector3DynamicPropertyChanged,
			removeFunction: this.removeVector3.bind(this),
			type: DynamicPropertyTypes.Vector3,
			typeCheck: isVector3,
			setFunction: this.root.setDynamicProperty.bind(this.root)
		});
	}
	getVector3(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const { type = DynamicPropertyTypes.Vector3, gotten = false } = this.dynamicProperties[key] ?? {};
		this.dynamicProperties[key] ??= {};
		if (type !== DynamicPropertyTypes.Vector3) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		if (!gotten) {
			this.dynamicProperties[key].gotten = true;
			this.dynamicProperties[key].value = this.root.getDynamicProperty(key) as Vector3;
			this.dynamicProperties[key].type = DynamicPropertyTypes.Vector3;
		}
		return this.dynamicProperties[key]?.value as Vector3 | undefined;
	}
	private removeInternal<t extends string | number | boolean | Vector3 | any>(key: string, data: {
		type: DynamicPropertyTypes,
		specificEvent: StorageChangedEventTemplate,
		getFunction: (key: string) => t,
		removeFunction: (key: string) => void;
	}) {
		const { type, specificEvent, removeFunction, getFunction } = data;
		if (typeof key !== "string") throw new Error(`key is not of type string`);
		const { type: typeCached = type, gotten = false } = this.dynamicProperties[key] ?? {};
		if (typeCached !== type) throw new Error(`key is assigned to type: ${this.dynamicProperties[key]?.type}`);
		let cancel: Boolean, cancelCache: Boolean, cancelSet: Boolean = false;
		const gottenValue = <any>getFunction(key);
		const { cancel: cancelSpecific, cancelCache: cancelCacheSpecific, cancelSet: cancelSetSpecific } = specificEvent.runEvent(this.root, key, gottenValue, undefined);
		const { cancel: cancelStorage, cancelCache: cancelCacheStorage, cancelSet: cancelSetStorage } = customEvents.storageChanged.runEvent(this.root, key, type, gottenValue, undefined);
		cancel = cancelSpecific || cancelStorage;
		cancelCache = cancelCacheSpecific || cancelCacheStorage;
		cancelSet = cancelSetSpecific || cancelSetStorage;
		if (cancel) return;
		if (!cancelCache) {
			this.dynamicProperties[key] ??= {};
			this.dynamicProperties[key].type = type;
			this.dynamicProperties[key].gotten = true;
			delete this.dynamicProperties[key].value;
		}
		if (cancelSet) return;
		removeFunction(key);
	}
	removeString(key: string) {
		this.removeInternal(key, {
			getFunction: this.getString.bind(this),
			specificEvent: customEvents.stringDynamicPropertyChanged,
			type: DynamicPropertyTypes.String,
			removeFunction: this.root.setDynamicProperty.bind(this.root),
		});
	}
	removeJSON(key: string) {
		this.removeInternal(key, {
			getFunction: this.getJSON.bind(this),
			specificEvent: customEvents.jsonDynamicPropertyChanged,
			type: DynamicPropertyTypes.JSON,
			removeFunction: (key) => {
				const previousChunks = (this.root.getDynamicProperty(`${key}_chunks`) ?? 0) as number;
				for (let i = 0; i < previousChunks; i++) {
					this.root.setDynamicProperty(`${key}_${i}`, undefined);
				}
			}
		});


	}
	removeNumber(key: string) {
		this.removeInternal(key, {
			getFunction: this.getNumber.bind(this),
			specificEvent: customEvents.numberDynamicPropertyChanged,
			type: DynamicPropertyTypes.Number,
			removeFunction: this.root.setDynamicProperty.bind(this.root),
		});
	}
	removeBoolean(key: string) {
		this.removeInternal(key, {
			getFunction: this.getBoolean.bind(this),
			specificEvent: customEvents.booleanDynamicPropertyChanged,
			type: DynamicPropertyTypes.Boolean,
			removeFunction: this.root.setDynamicProperty.bind(this.root),
		});
	}
	removeVector3(key: string) {
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
			let previousValue: number | boolean | string | Vector3 | undefined;
			let type: StorageChangedType = StorageChangedType.All;
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
		if (cancel) return;
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
	get jsons(): Record<string, any | undefined> {
		const thisEntityStorage = this;
		return new Proxy({}, {
			set: (target, key, value, receiver) => {
				thisEntityStorage.setJSON(key as string, value);
				return Reflect.set(target, key, value, receiver);
			},
			get: (target, key, receiver) => {
				return thisEntityStorage.getJSON(key as string);
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

			if (!this.root.scoreboardIdentity) {
				if (!fixObjective) return;
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

	removeScore(key: string) {
		if (typeof key !== 'string') throw new Error('key is not of type string');
		const objective = this.scoresStorage[key]?.objective ?? world.scoreboard.getObjective(key);
		objective?.removeParticipant(this.root);
		this.scoresStorage[key] ??= {};
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