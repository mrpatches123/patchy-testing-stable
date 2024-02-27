import { worldInitialize } from './events/world_initialize.js';
import { playerJoined } from './events/player_joined.js';
export class Events {
    constructor() {
        this.worldInitialize = worldInitialize;
        this.playerJoined = playerJoined;
    }
}
export const events = new Events();
//# sourceMappingURL=events.js.map