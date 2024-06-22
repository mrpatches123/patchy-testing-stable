import { world, system } from "@minecraft/server";
import { Vector } from "./vector";
import { FormCancelationReason } from "@minecraft/server-ui";
export const overworld = world.getDimension("overworld");
export const nether = world.getDimension("nether");
export const end = world.getDimension("the_end");
export const content = {
    warn(...messages) {
        console.warn(messages.map(message => JSON.stringify(message, (key, value) => (value instanceof Function) ? '<f>' : value)).join(' '));
    },
    chatFormat(...messages) {
        chunkString(messages.map(message => JSON.stringify(message, (key, value) => (value instanceof Function) ? '<f>' : value, 4)).join(' '), 500).forEach(message => world.sendMessage(message));
    }
};
export function toProperCaseTypeId(typeId) {
    return toProperCase(typeId.replace(/\w+:/, ""));
}
export function toProperCase(string) {
    return string.replace(/[_.]/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}
export function toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|(\b|_)\w)/g, (word, index) => word.toUpperCase()).replace(/[\s_]+/g, '').replace(/\w/, (world) => world.toLowerCase());
}
try {
    world.scoreboard.addObjective("test");
}
catch (e) { }
export function fixPlayerScore(player) {
    if (!player.scoreboardIdentity)
        player.runCommand('scoreboard players set @s test 0');
}
export function iterateObject(obj, callback) {
    let i = 0;
    const objectPrototype = Object.getPrototypeOf({});
    for (const key in obj) {
        if (key in objectPrototype)
            continue;
        callback(key, obj[key], i++);
    }
}
export function isDefined(value) {
    return value !== undefined && value !== null && typeof value !== 'number' || Number.isFinite(value);
}
export function isVector3(value) {
    return typeof value.x === 'number' && typeof value.y === 'number' && typeof value.z === 'number';
}
export function chunkString(str, length) {
    let size = (str.length / length) | 0;
    const array = Array(++size);
    for (let i = 0, offset = 0; i < size; i++, offset += length) {
        array[i] = str.substr(offset, length);
    }
    return array;
}
export const facingDirectionToVector3 = {
    0: { x: 0, y: -1, z: 0 },
    1: { x: 0, y: 1, z: 0 },
    2: { x: 0, y: 0, z: 1 },
    3: { x: 0, y: 0, z: -1 },
    4: { x: 1, y: 0, z: 0 },
    5: { x: -1, y: 0, z: 0 },
};
export function parseCommand(message, prefix) {
    const messageLength = message.length;
    let finding = false;
    let braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0;
    let started = false;
    let o = 0;
    const output = [];
    for (let i = prefix.length; i < messageLength; i++) {
        const char = message[i];
        switch (char) {
            case '{':
                switch (finding) {
                    case 'json':
                        break;
                    default:
                        braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
                        output.push('');
                        o++;
                        finding = 'json';
                        break;
                }
                output[o] += char;
                braceCount[0]++;
                break;
            case '}':
                output[o] += char;
                if (braceCount[0] !== ++braceCount[1] || bracketCount[0] !== bracketCount[1] || (quoteCount && quoteCount & 1))
                    break;
                braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
                break;
            case ']':
                output[o] += char;
                if (bracketCount[0] !== ++bracketCount[1] || braceCount[0] !== braceCount[1] || (quoteCount && quoteCount & 1))
                    break;
                braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
                break;
            case '"':
                switch (finding) {
                    case 'json':
                        output[o] += char;
                        break;
                    default:
                        braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
                        finding = 'string';
                    case 'string':
                        if (!(++quoteCount & 1)) {
                            finding = false;
                            break;
                        }
                        ;
                        if (!output[o].length)
                            break;
                        output.push('');
                        o++;
                        break;
                }
                break;
            case '[':
                switch (finding) {
                    case 'json':
                        break;
                    default:
                        output.push('');
                        o++;
                        finding = 'json';
                        break;
                }
                output[o] += char;
                bracketCount[0]++;
                break;
            case ' ':
                switch (finding) {
                    case 'string':
                    case 'json':
                        if (!(quoteCount & 1))
                            break;
                        output[o] += char;
                        break;
                    default:
                        const nextChar = message?.[i + 1];
                        switch (nextChar) {
                            case ' ':
                            case '[':
                            case '{':
                            case '"':
                                break;
                            default:
                                output.push('');
                                o++;
                                finding = 'word';
                                break;
                        }
                        break;
                }
                break;
            default:
                if (!started) {
                    started = true;
                    finding = 'word';
                    output.push('');
                    spaceCount = 1;
                }
                switch (char) {
                    case '@':
                        if (finding === 'string') {
                            output[o] += char;
                            break;
                        }
                        const nextChar = message?.[i + 1];
                        switch (nextChar) {
                            case '"':
                                break;
                            default:
                                const afterNextChar = message?.[i + 2];
                                switch (afterNextChar) {
                                    case ' ':
                                        finding = 'string';
                                        output[o] += char;
                                        break;
                                    case '[':
                                        finding = 'json';
                                        output[o] += char;
                                        break;
                                }
                                break;
                        }
                        break;
                    default:
                        output[o] += char;
                        break;
                }
                break;
        }
    }
    return output;
}
export function cartesianToCircular(vector, center = { x: 0, y: 0, z: 0 }) {
    const { x, z } = vector;
    const { x: xc, z: zc } = center;
    const xd = x - xc;
    const zd = z - zc;
    const r = Math.sqrt((xd) ** 2 + (zd) ** 2);
    let thetaT;
    if (zd >= 0) {
        thetaT = Math.atan2(zd, xd);
    }
    else {
        thetaT = 2 * Math.PI + Math.atan2(zd, xd);
    }
    return ({ theta: thetaT, r, x, z });
}
const PI2 = 2 * Math.PI;
export function differenceRadians(theta1, theta2) {
    const t1 = theta1 % (PI2);
    const t2 = theta2 % (PI2);
    let r1 = t1 - t2;
    let r2 = t1 - (t2 + PI2);
    return (Math.abs(r1) > Math.abs(r2)) ? r2 : r1;
}
export function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
}
export function giveItem(player, item) {
    const container = player.getComponent("minecraft:inventory").container;
    const itemRemainder = container.addItem(item);
    if (!itemRemainder)
        return;
    player.dimension.spawnItem(itemRemainder, player.location);
}
export function sendMessageMessageToOtherPlayers(excludePlayers, message) {
    world.getAllPlayers().forEach((player) => {
        if (excludePlayers.some(p => p.id === player.id))
            return;
        player.sendMessage(message);
    });
}
;
/**
 * Entity may not be loaded once
 */
export async function spawnEntityAsync(dimension, typeId, location, callback, tickingArea = true) {
    let entity;
    try {
        try {
            entity = dimension.spawnEntity(typeId, location);
        }
        catch (error) {
            console.warn('ingore', error, error.stack);
        }
        let tickAreaCreated = false;
        entity = ((entity && entity.isValid()) ? entity : await new Promise(async (resolve) => {
            let tickingAreaRemoved = false;
            try {
                const commandResult = await dimension.runCommandAsync(`tickingarea remove spawnEntityAsyncTick`);
                tickingAreaRemoved = Boolean(commandResult.successCount);
            }
            catch { }
            if (tickingAreaRemoved)
                await sleep(1);
            const { x, y, z } = location;
            if (tickingArea) {
                tickAreaCreated = true;
                await dimension.runCommandAsync(`tickingarea add ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} spawnEntityAsyncTick`);
            }
            const cancelRun = systemRunIntervalAwaitCallback(async () => {
                try {
                    entity = (!entity) ? dimension.spawnEntity(typeId, location) : entity;
                    if (!entity)
                        return;
                    if (!entity.isValid())
                        return;
                    cancelRun();
                    resolve(entity);
                }
                catch (error) {
                    console.warn('ingore', error, error.stack);
                }
            });
        }));
        await callback?.(entity);
        if (tickAreaCreated)
            await dimension.runCommandAsync(`tickingarea remove spawnEntityAsyncTick`);
    }
    catch (error) {
        console.warn('ingore', error, error.stack);
    }
    return entity;
}
/**
 * Entity may not be loaded once
 */
export async function spawnItemAsync(dimension, itemStack, location, callback, tickingArea = true) {
    let entity;
    try {
        try {
            entity = dimension.spawnItem(itemStack, location);
        }
        catch (error) {
            console.warn('ingore', error, error.stack);
        }
        let tickAreaCreated = false;
        entity = ((entity && entity.isValid()) ? entity : await new Promise(async (resolve) => {
            let tickingAreaRemoved = false;
            try {
                const commandResult = await dimension.runCommandAsync(`tickingarea remove spawnItemAsyncTick`);
                tickingAreaRemoved = Boolean(commandResult.successCount);
            }
            catch { }
            if (tickingAreaRemoved)
                await sleep(1);
            const { x, y, z } = location;
            if (tickingArea) {
                tickAreaCreated = true;
                await dimension.runCommandAsync(`tickingarea add ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} spawnItemAsyncTick`);
            }
            const cancelRun = systemRunIntervalAwaitCallback(async () => {
                try {
                    entity = (!entity) ? dimension.spawnItem(itemStack, location) : entity;
                    if (!entity)
                        return;
                    if (!entity.isValid())
                        return;
                    cancelRun();
                    resolve(entity);
                }
                catch (error) {
                    console.warn('ingore', error, error.stack);
                }
            });
        }));
        await callback?.(entity);
        if (tickAreaCreated)
            await dimension.runCommandAsync(`tickingarea remove spawnItemAsyncTick`);
    }
    catch (error) {
        console.warn('ingore', error, error.stack);
    }
    return entity;
}
export async function getEntityAsync(dimension, entityQueryOptions, callback, timeoutTicks = Infinity, tickingArea = true) {
    let entity;
    try {
        if (!entityQueryOptions.location)
            throw new Error('location is required');
        entityQueryOptions.closest = 1;
        const { x, y, z } = entityQueryOptions.location;
        try {
            entity = dimension.getEntities(entityQueryOptions)[0];
        }
        catch (error) {
            console.warn('ingore', error, error.stack);
        }
        let tickAreaCreated = false;
        let i = 0;
        entity = ((entity && entity.isValid()) ? entity : await new Promise(async (resolve) => {
            let tickingAreaRemoved = false;
            try {
                const commandResult = await dimension.runCommandAsync(`tickingarea remove getEntityAsyncTick`);
                tickingAreaRemoved = Boolean(commandResult.successCount);
            }
            catch { }
            if (tickingAreaRemoved)
                await sleep(1);
            if (tickingArea) {
                tickAreaCreated = true;
                await dimension.runCommandAsync(`tickingarea add ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} getEntityAsyncTick`);
            }
            const cancelRun = systemRunIntervalAwaitCallback(async () => {
                if (i++ > timeoutTicks) {
                    cancelRun();
                    resolve(entity);
                }
                try {
                    entity = (!entity || !entity.isValid()) ? dimension.getEntities(entityQueryOptions)[0] : entity;
                    if (!entity)
                        return;
                    if (!entity.isValid())
                        return;
                    cancelRun();
                    resolve(entity);
                }
                catch (error) {
                    console.warn('ingore', error, error.stack);
                }
            });
        }));
        await callback?.(entity);
        if (tickAreaCreated)
            await dimension.runCommandAsync(`tickingarea remove getEntityAsyncTick`);
    }
    catch (error) {
        console.warn('ingore', error, error.stack);
    }
    return entity;
}
export async function getBlockArrayAsync(dimension, blockLocations, callback, tickingArea = true) {
    try {
        let locations = [Vector.minVectors(blockLocations).toVector3(), Vector.maxVectors(blockLocations).toVector3()];
        let blocks = Array(blockLocations.length);
        let tickingAreaCreated = false;
        async function createTickingArea() {
            if (!tickingArea || tickingAreaCreated)
                return;
            let tickingAreaRemoved = false;
            try {
                const commandResult = await dimension.runCommandAsync(`tickingarea remove getBlockAsyncTick`);
                tickingAreaRemoved = Boolean(commandResult.successCount);
            }
            catch { }
            if (tickingAreaRemoved)
                await sleep(1);
            tickingAreaCreated = true;
            await dimension.runCommandAsync(`tickingarea add ${Math.floor(locations[0].x)} ${Math.floor(locations[0].y)} ${Math.floor(locations[0].z)} ${Math.floor(locations[1].x)} ${Math.floor(locations[1].y)} ${Math.floor(locations[1].z)} getBlockAsyncTick`);
        }
        async function removeTickingArea() {
            if (!tickingAreaCreated)
                return;
            await dimension.runCommandAsync(`tickingarea remove getBlockAsyncTick`);
        }
        for (let i = 0; i < blockLocations.length; i++) {
            let location = blockLocations[i];
            let block;
            try {
                try {
                    block = dimension.getBlock(location);
                }
                catch (error) {
                    console.warn('ingore', error, error.stack);
                }
                block = ((block && block.isValid()) ? block : await new Promise(async (resolve) => {
                    try {
                        await createTickingArea();
                        const cancelRun = systemRunIntervalAwaitCallback(async () => {
                            try {
                                block = (!block) ? dimension.getBlock(location) : block;
                                if (!block)
                                    return;
                                if (!block.isValid())
                                    return;
                                cancelRun();
                                resolve(block);
                            }
                            catch (error) {
                                console.warn('ingore', error, error.stack);
                            }
                        });
                    }
                    catch (error) {
                        console.warn('ingore', error, error.stack);
                    }
                }));
                blocks[i] = block;
            }
            catch (error) {
                console.warn('ingore', error, error.stack);
            }
        }
        callback?.(blocks);
        await removeTickingArea();
        return blocks;
    }
    catch (error) {
        console.warn('ingore', error, error.stack);
    }
    return [];
}
export async function spawnEntityArrayAsync(dimension, entitySpawnData, callback, tickingArea = true) {
    try {
        const locationsArray = entitySpawnData.map(({ location }) => location);
        let locations = [Vector.minVectors(locationsArray).toVector3(), Vector.maxVectors(locationsArray).toVector3()];
        let entities = Array(entitySpawnData.length);
        let tickingAreaCreated = false;
        async function createTickingArea() {
            if (!tickingArea || tickingAreaCreated)
                return;
            let tickingAreaRemoved = false;
            try {
                const commandResult = await dimension.runCommandAsync(`tickingarea remove getBlockAsyncTick`);
                tickingAreaRemoved = Boolean(commandResult.successCount);
            }
            catch { }
            if (tickingAreaRemoved)
                await sleep(1);
            tickingAreaCreated = true;
            await dimension.runCommandAsync(`tickingarea add ${Math.floor(locations[0].x)} ${Math.floor(locations[0].y)} ${Math.floor(locations[0].z)} ${Math.floor(locations[1].x)} ${Math.floor(locations[1].y)} ${Math.floor(locations[1].z)} getBlockAsyncTick`);
        }
        async function removeTickingArea() {
            if (!tickingAreaCreated)
                return;
            await dimension.runCommandAsync(`tickingarea remove getBlockAsyncTick`);
        }
        for (let i = 0; i < entitySpawnData.length; i++) {
            let { location, typeId } = entitySpawnData[i];
            let entity;
            try {
                try {
                    entity = dimension.spawnEntity(typeId, location);
                }
                catch (error) {
                    console.warn('ingore', error, error.stack);
                }
                entity = ((entity && entity.isValid()) ? entity : await new Promise(async (resolve) => {
                    try {
                        await createTickingArea();
                        const cancelRun = systemRunIntervalAwaitCallback(async () => {
                            try {
                                entity = (!entity) ? dimension.spawnEntity(typeId, location) : entity;
                                if (!entity)
                                    return;
                                if (!entity.isValid())
                                    return;
                                cancelRun();
                                resolve(entity);
                            }
                            catch (error) {
                                console.warn('ingore', error, error.stack);
                            }
                        });
                    }
                    catch (error) {
                        console.warn('ingore', error, error.stack);
                    }
                }));
                entities[i] = entity;
            }
            catch (error) {
                console.warn('ingore', error, error.stack);
            }
        }
        callback?.(entities);
        await removeTickingArea();
        return entities;
    }
    catch (error) {
        console.warn('ingore', error, error.stack);
    }
    return [];
}
export async function getBlocksAsync(dimension, blockLocations, callback, tickingArea = true) {
    try {
        let locations;
        if (isVector3(blockLocations))
            locations = [blockLocations, blockLocations];
        else {
            locations = [Vector.min(blockLocations[0], blockLocations[1]).toVector3(), Vector.max(blockLocations[0], blockLocations[1]).toVector3()];
        }
        let blocks = Array(Vector.areaBetweenFloored(locations[0], locations[1]));
        let tickingAreaCreated = false;
        async function createTickingArea() {
            if (!tickingArea || tickingAreaCreated)
                return;
            console.warn('createdTickingArea');
            let tickingAreaRemoved = false;
            try {
                const commandResult = await dimension.runCommandAsync(`tickingarea remove getBlockAsyncTick`);
                tickingAreaRemoved = Boolean(commandResult.successCount);
            }
            catch { }
            if (tickingAreaRemoved)
                await sleep(1);
            tickingAreaCreated = true;
            await dimension.runCommandAsync(`tickingarea add ${Math.floor(locations[0].x)} ${Math.floor(locations[0].y)} ${Math.floor(locations[0].z)} ${Math.floor(locations[1].x)} ${Math.floor(locations[1].y)} ${Math.floor(locations[1].z)} getBlockAsyncTick`);
        }
        async function removeTickingArea() {
            if (!tickingAreaCreated)
                return;
            await dimension.runCommandAsync(`tickingarea remove getBlockAsyncTick`);
        }
        for (let i = 0, x = locations[0].x; x <= locations[1].x; x++) {
            for (let y = locations[0].y; y <= locations[1].y; y++) {
                for (let z = locations[0].z; z <= locations[1].z; z++, i++) {
                    let block;
                    const location = { x, y, z };
                    try {
                        try {
                            block = dimension.getBlock(location);
                        }
                        catch (error) {
                            console.warn('ingore', error, error.stack);
                        }
                        block = ((block && block.isValid()) ? block : await new Promise(async (resolve) => {
                            try {
                                await createTickingArea();
                                const cancelRun = systemRunIntervalAwaitCallback(async () => {
                                    try {
                                        block = (!block) ? dimension.getBlock(location) : block;
                                        if (!block)
                                            return;
                                        if (!block.isValid())
                                            return;
                                        cancelRun();
                                        resolve(block);
                                    }
                                    catch (error) {
                                        console.warn('ingore', error, error.stack);
                                    }
                                });
                            }
                            catch (error) {
                                console.warn('ingore', error, error.stack);
                            }
                        }));
                        blocks[i++] = block;
                    }
                    catch (error) {
                        console.warn('ingore', error, error.stack);
                    }
                }
            }
        }
        callback?.(blocks);
        await removeTickingArea();
        return blocks;
    }
    catch (error) {
        console.warn('ingore', error, error.stack);
    }
    return [];
}
/**
 * @param {() => void | Promise<void>} callback
 * @param {number} tickDelay
 * @returns {() => void} cancel() run to cancel
 */
export function systemRunIntervalAwaitCallback(callback, tickDelay = 0) {
    let currentId;
    const run = async () => {
        try {
            await callback();
            currentId = system.runTimeout(run, tickDelay);
        }
        catch (error) {
            console.warn("Error below stack: ", error.stack);
            throw error;
        }
    };
    currentId = system.run(run);
    return () => {
        if (isDefined(currentId))
            system.clearRun(currentId);
    };
}
/**
 *
 * @param {number} ticks
 * @returns {Promise<undefined>}
 */
export async function sleep(ticks) {
    return new Promise((resolve) => system.runTimeout(() => resolve(undefined), ticks));
}
/**
 * @type {Record<string, boolean>}
 */
const playersAwaitingForm = {};
/**
 * @type {Parameters<PlayerLeaveBeforeEventSignal['subscribe']>[0]}
 */
const leaveCallback = (event) => {
    delete playersAwaitingForm[event.player.id];
};
/**
 * @type {boolean}
 */
const subscribedLeaveEvent = false;
/**
 * @returns {void}
 */
function subscribeLeaveEvent() {
    if (subscribedLeaveEvent)
        return;
    world.beforeEvents.playerLeave.subscribe(leaveCallback);
}
/**
 * @template {T extends ActionFormData | ModalFormData | MessageFormData} T
 * @param {Player} receiver
 * @param {T} form
 * @returns {T extends ActionFormData ? Promise<ActionFormResponse | undefined> : T extends MessageFormData ? Promise<MessageFormResponse | undefined> : Promise< ModalFormResponse | undefined>}
 */
export async function showFormAwaitPlayerNotBusy(receiver, form) {
    let response;
    subscribeLeaveEvent();
    if (receiver.id in playersAwaitingForm)
        return;
    try {
        while (true) {
            if (!receiver || !receiver.isValid())
                break;
            response = await form.show(receiver);
            if (response?.cancelationReason !== FormCancelationReason.UserBusy) {
                break;
            }
            await sleep();
        }
    }
    catch (error) {
        console.warn(error.stack);
        throw error;
    }
    delete playersAwaitingForm[receiver.id];
    if (!Object.keys(playersAwaitingForm).length)
        world.beforeEvents.playerLeave.unsubscribe(leaveCallback);
    return response;
}
//# sourceMappingURL=utilities.js.map