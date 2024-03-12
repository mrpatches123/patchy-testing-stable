import { world } from "@minecraft/server";
export const overworld = world.getDimension("overworld");
export const nether = world.getDimension("nether");
export const end = world.getDimension("the_end");
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
