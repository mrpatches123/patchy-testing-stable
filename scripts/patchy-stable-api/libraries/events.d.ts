export { StorageChangedType } from './events/storage_changed.js';
export declare const customEvents: {
    readonly worldInitialize: import("./events/world_initialize.js").WorldInitializeEvent;
    readonly playerJoined: import("./events/player_joined.js").PlayerJoinedEvent;
    readonly storageChanged: import("./events/storage_changed.js").StorageChangedEvent;
    readonly stringDynamicPropertyChanged: import("./events/string_dynamic_property_changed.js").StringDynamicPropertyChangedEvent;
    readonly jsonDynamicPropertyChanged: import("./events/json_dynamic_property_changed.js").JSONDynamicPropertyChangedEvent;
    readonly numberDynamicPropertyChanged: import("./events/number_dynamic_property_changed.js").NumberDynamicPropertyChangedEvent;
    readonly vector3DynamicPropertyChanged: import("./events/vector3_dynamic_property_changed.js").Vector3DynamicPropertyChangedEvent;
    readonly booleanDynamicPropertyChanged: import("./events/boolean_dynamic_property_changed.js").BooleanDynamicPropertyChangedEvent;
    readonly scoreChanged: import("./events/score_changed.js").BooleanDynamicPropertyChangedEvent;
    readonly beforeItemUseOnFirst: import("./events/before_item_use_on_first.js").BeforeItemUseOnFirstEvent;
};
