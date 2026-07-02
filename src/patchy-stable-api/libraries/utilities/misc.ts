import { Vector3 } from "@minecraft/server";

export class MiscUtilities {
	static iterateObject<T extends Record<string, any>>(obj: T, callback: (key: keyof T, value: T[keyof T], i: number) => void) {
		let i = 0;
		const objectPrototype = Object.getPrototypeOf({});
		for (const key in obj) {
			if (key in objectPrototype) continue;
			callback(key, obj[key], i++);
		}
	}
	static isDefined<T>(value: T | undefined | null): value is T {
		return value !== undefined && value !== null && typeof value !== 'number' || Number.isFinite(value);
	}
	static isVector3(value: any): value is Vector3 {
		return typeof value.x === 'number' && typeof value.y === 'number' && typeof value.z === 'number';
	}
}