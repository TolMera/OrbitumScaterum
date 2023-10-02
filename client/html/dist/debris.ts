import type { Point } from "./canvas";

export class DebrisController {
	model: DebrisModel = new DebrisModel();

	spawnDebris() {
		return this.model.newDebris();
	}

	collision(p1: DebrisRecord, p2: DebrisRecord) {
		if (!(p1.type === "debris" && p2.type === "debris")) return;

		let tactic: string = "merge";
		if (p1.mass + p2.mass > 1000) {
			tactic = "biggerRockWins";
		}

		switch (tactic) {
			case "biggerRockWins": {
				if (p1.mass > p2.mass) {
					p2.mass = 0;
				} else {
					p1.mass = 0;
				}
			}

			case "merge": {
				if (!(p1.type === "debris" && p2.type === "debris")) return;

				const totalMass = p1.mass + p2.mass;
				p1.vector.x =
					p2.vector.x * (p2.mass / totalMass) +
					p1.vector.x * (p1.mass / totalMass);
				p2.vector.x = 0;
				p1.vector.y =
					p2.vector.y * (p2.mass / totalMass) +
					p1.vector.y * (p1.mass / totalMass);
				p2.vector.y = 0;

				p1.mass += p2.mass;
				p2.mass = 0;
			}
		}
	}
}

type Vector = Point;

const G = 6.6743e-11;
const M = 5.972e24;

export type DebrisRecord = {
	type: string;
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
			y: Math.sqrt((G * M) / Math.abs(point.x)),
			// * (Math.random() > 0.5 ? -1 : 1),
		};
		const mass = Math.max(2, Number((Math.random() * 100).toFixed(0)));

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
