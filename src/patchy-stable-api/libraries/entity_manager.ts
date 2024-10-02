import { Dimension, Entity, EntityDieAfterEvent, EntityDieAfterEventSignal, EntityHealthChangedAfterEventSignal, EntityHitEntityAfterEventSignal, EntityHurtAfterEvent, EntityHurtAfterEventSignal, EntityLoadAfterEventSignal, EntityRemoveAfterEvent, EntityRemoveBeforeEvent, EntitySpawnAfterEvent, ProjectileHitEntityAfterEvent, ProjectileHitEntityAfterEventSignal, Vector3, world, WorldAfterEvents } from "@minecraft/server";
import { storage } from "./properties";
import { overworld } from "./utilities";

const worldStorage = storage.get();
const EntityEvents = {
	entityDie: { event: world.afterEvents.entityDie, entityKey: 'deadEntity' },
	entityHurt: { event: world.afterEvents.entityHurt, entityKey: 'hurtEntity' },
	beforeEntityRemoved: { event: world.beforeEvents.entityRemove, entityKey: "removedEntity" },
	entityRemoved: { event: world.afterEvents.entityRemove, entityKey: (event: EntityRemoveAfterEvent, entityIds: string[]) => entityIds.some(id => event.removedEntityId === id) },
	entityHit: { event: world.afterEvents.entityHitEntity, entityKey: 'hitEntity' },
	projectileHitEntity: { event: world.afterEvents.projectileHitEntity, entityKey: (event: ProjectileHitEntityAfterEvent, entityIds: string[]) => entityIds.some(id => event.getEntityHit()?.entity?.id === id) },
	entityHealthChange: { event: world.afterEvents.entityHealthChanged, entityKey: 'entity' },
	entityLoad: { event: world.afterEvents.entityLoad, entityKey: 'entity' },
	entitySpawn: { event: world.afterEvents.entitySpawn, entityKey: 'entity' }
} as const;
class EntityManager {
	entities: Record<string, { entities?: Record<string, Entity | undefined>; events?: Record<string, (event: any) => void>; }>;
	constructor() {
		this.entities = {};
	}
	addEntity(key: string, entity: Entity) {
		this.entities[key] ??= {};
		this.entities[key]!.entities ??= {};
		this.entities[key]!.entities![entity.id] = entity;
		worldStorage.jsons[`em-${key}`] ??= {};
		worldStorage.jsons[`em-${key}`][entity.id] = entity;
	}
	removeEntity(key: string, entity: Entity | string) {
		const id = typeof entity === "string" ? entity : entity.id;
		try {
			delete this.entities[key].entities![id];
		} catch { }
		try {
			delete worldStorage.jsons[`em-${key}`][id];
		} catch { }
	}
	despawnEntity(key: string, entity: Entity | string) {
		const id = typeof entity === "string" ? entity : entity.id;
		this.removeEntity(key, entity);
		try {
			world.getEntity(id)?.remove();
		} catch { }
	}
	spawnEntity(key: string, typeId: string, location: Vector3, dimension: Dimension = overworld) {
		const entity = dimension.spawnEntity(typeId, location);
		this.addEntity(key, entity);
		return entity;
	}
	despawnEntities(key: string) {
		Object.keys(this.entities[key]).forEach(([id]) => {
			this.despawnEntity(key, id);
		});
	}
	subscribe<T extends keyof typeof EntityEvents>(key: string, eventKey: T, callback: Parameters<typeof EntityEvents[T]['event']['subscribe']>[0]) {
		this.entities[key] ??= {};
		this.entities[key].events ??= {};
		this.entities[key].events[eventKey] = callback;
		const systemCallback = (event: any) => {
			const { entityKey } = EntityEvents[eventKey];
			const entityIds = Object.keys(this.entities[key].entities ?? {});
			if (entityKey instanceof Function) {
				if (!entityKey(event, entityIds)) return;
			} else if (!entityIds.some(id => id === event[entityKey as any])) return;
			callback(event);
		};
	}
}
const entityManager = new EntityManager();
