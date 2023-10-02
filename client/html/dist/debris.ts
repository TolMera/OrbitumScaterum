import type { Point } from "./canvas";

export class DebrisController {
	model: DebrisModel = new DebrisModel();

	spawnDebris() {
		return this.model.newDebris();
	}

	collision(p1: DebrisRecord, p2: DebrisRecord) {
		let main: DebrisRecord;
		let second: DebrisRecord;
		if (p1.mass > p2.mass) {
			main = p1;
			second = p2;
		} else {
			main = p2;
			second = p1;
		}

		const totalMass = main.mass + second.mass;
		main.vector.x = (second.vector.x * (second.mass/totalMass)) + (main.vector.x * (main.mass/totalMass));
		second.vector.x = 0;
		main.vector.y = (second.vector.y * (second.mass/totalMass)) + (main.vector.y * (main.mass/totalMass));
		second.vector.y = 0;

		main.mass += second.mass;
		second.mass = 0;
	}
}

type Vector = Point;

const G = 6.6743e-11;
const M = 5.972e24;

export type DebrisRecord = {
	type: string,
	point: Point;
	vector: Vector;
	mass: number;
	update: Function;
	complete: Function;
};

export class DebrisModel {
	minimumOrbit = 650;
	maximumOrbit = 7_250;

	newDebris() {
		const point: Point = {
			x: Math.max(Math.random() * this.maximumOrbit, this.minimumOrbit),
			y: 0,
		};
		const vector: Vector = {
			x: 0,
			y:
				Math.sqrt((G * M) / Math.abs(point.x)) *
				(Math.random() > 0.5 ? -1 : 1),
		};
		const mass = Math.max(2, Number((Math.random() * 1000).toFixed(0)));

		const update = function (time: number) {
			const r = Math.sqrt(point.x * point.x + point.y * point.y);
			let a = (G * M) / (r * r);

			// Update velocity using acceleration
			vector.x += ((-a * point.x) / r) * time;
			vector.y += ((-a * point.y) / r) * time;

			// Update position using velocity
			point.x += vector.x * time;
			point.y += vector.y * time;
		};

		const record = {
			type: "debris",
			point,
			vector,
			mass,
			update,
			complete: (item: DebrisRecord) => {
				if (item.mass < 1) return true;
				return false;
			},
		};

		return record;
	}
}
