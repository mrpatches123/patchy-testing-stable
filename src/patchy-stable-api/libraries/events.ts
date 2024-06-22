import { worldInitialize } from './events/world_initialize.js';
import { playerJoined } from './events/player_joined.js';
import { storageChanged } from './events/storage_changed.js';
import { stringDynamicPropertyChanged } from './events/string_dynamic_property_changed.js';
import { numberDynamicPropertyChanged } from './events/number_dynamic_property_changed.js';
import { vector3DynamicPropertyChanged } from './events/vector3_dynamic_property_changed.js';
import { booleanDynamicPropertyChanged } from './events/boolean_dynamic_property_changed.js';
import { scoreChanged } from './events/score_changed.js';
import { jsonDynamicPropertyChanged } from './events/json_dynamic_property_changed.js';
import { beforeItemUseOnFirst } from './events/before_item_use_on_first.js';
export { StorageChangedType } from './events/storage_changed.js';

export const customEvents = {
	worldInitialize: worldInitialize,
	playerJoined: playerJoined,
	storageChanged: storageChanged,
	stringDynamicPropertyChanged: stringDynamicPropertyChanged,
	jsonDynamicPropertyChanged: jsonDynamicPropertyChanged,
	numberDynamicPropertyChanged: numberDynamicPropertyChanged,
	vector3DynamicPropertyChanged: vector3DynamicPropertyChanged,
	booleanDynamicPropertyChanged: booleanDynamicPropertyChanged,
	scoreChanged: scoreChanged,
	beforeItemUseOnFirst: beforeItemUseOnFirst,
} as const;

