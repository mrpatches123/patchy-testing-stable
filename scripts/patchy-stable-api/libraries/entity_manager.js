import { world } from "@minecraft/server";
import { storage } from "./properties";
import { overworld } from "./utilities";
const worldStorage = storage.get();
const EntityEvents = {
    entityDie: { event: world.afterEvents.entityDie, entityKey: 'deadEntity' },
    entityHurt: { event: world.afterEvents.entityHurt, entityKey: 'hurtEntity' },
    beforeEntityRemoved: { event: world.beforeEvents.entityRemove, entityKey: "removedEntity" },
    entityRemoved: { event: world.afterEvents.entityRemove, entityKey: (event, entityIds) => entityIds.some(id => event.removedEntityId === id) },
    entityHit: { event: world.afterEvents.entityHitEntity, entityKey: 'hitEntity' },
    projectileHitEntity: { event: world.afterEvents.projectileHitEntity, entityKey: (event, entityIds) => entityIds.some(id => event.getEntityHit()?.entity?.id === id) },
    entityHealthChange: { event: world.afterEvents.entityHealthChanged, entityKey: 'entity' },
    entityLoad: { event: world.afterEvents.entityLoad, entityKey: 'entity' },
    entitySpawn: { event: world.afterEvents.entitySpawn, entityKey: 'entity' }
};
class EntityManager {
    entities;
    constructor() {
        this.entities = {};
    }
    addEntity(key, entity) {
        this.entities[key] ??= {};
        this.entities[key].entities ??= {};
        this.entities[key].entities[entity.id] = entity;
        worldStorage.jsons[`em-${key}`] ??= {};
        worldStorage.jsons[`em-${key}`][entity.id] = entity;
    }
    removeEntity(key, entity) {
        const id = typeof entity === "string" ? entity : entity.id;
        try {
            delete this.entities[key].entities[id];
        }
        catch { }
        try {
            delete worldStorage.jsons[`em-${key}`][id];
        }
        catch { }
    }
    despawnEntity(key, entity) {
        const id = typeof entity === "string" ? entity : entity.id;
        this.removeEntity(key, entity);
        try {
            world.getEntity(id)?.remove();
        }
        catch { }
    }
    spawnEntity(key, typeId, location, dimension = overworld) {
        const entity = dimension.spawnEntity(typeId, location);
        this.addEntity(key, entity);
        return entity;
    }
    despawnEntities(key) {
        Object.keys(this.entities[key]).forEach(([id]) => {
            this.despawnEntity(key, id);
        });
    }
    subscribe(key, eventKey, callback) {
        this.entities[key] ??= {};
        this.entities[key].events ??= {};
        this.entities[key].events[eventKey] = callback;
        const systemCallback = (event) => {
            const { entityKey } = EntityEvents[eventKey];
            const entityIds = Object.keys(this.entities[key].entities ?? {});
            if (entityKey instanceof Function) {
                if (!entityKey(event, entityIds))
                    return;
            }
            else if (!entityIds.some(id => id === event[entityKey]))
                return;
            callback(event);
        };
    }
}
const entityManager = new EntityManager();
