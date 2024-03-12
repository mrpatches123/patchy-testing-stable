import { worldInitialize } from './events/world_initialize.js';
import { playerJoined } from './events/player_joined.js';

export const customEvents = {
	worldInitialize: worldInitialize,
	playerJoined: playerJoined,
} as const;

