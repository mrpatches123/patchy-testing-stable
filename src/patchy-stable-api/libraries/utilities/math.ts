import { Vector3 } from "@minecraft/server";

export class MathUtilities {
	static cartesianToCircular(vector: Vector3, center: Vector3 = { x: 0, y: 0, z: 0 }) {
		const { x, z } = vector;
		const { x: xc, z: zc } = center;
		const xd = x - xc;
		const zd = z - zc;
		const r = Math.sqrt((xd) ** 2 + (zd) ** 2);
		let thetaT;
		if (zd >= 0) {
			thetaT = Math.atan2(zd, xd);
		} else {
			thetaT = 2 * Math.PI + Math.atan2(zd, xd);
		}
		return ({ theta: thetaT, r, x, z });
	}
	static PI2 = 2 * Math.PI;
	static differenceRadians(theta1: number, theta2: number) {
		const t1 = theta1 % (MathUtilities.PI2);
		const t2 = theta2 % (MathUtilities.PI2);
		let r1 = t1 - t2;
		let r2 = t1 - (t2 + MathUtilities.PI2);
		return (Math.abs(r1) > Math.abs(r2)) ? r2 : r1;

	}
}