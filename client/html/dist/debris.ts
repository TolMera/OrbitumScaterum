import {
	G,
	M,
	ObjectRecord,
	Point,
	Vector,
	calculateCircularOrbit,
	update,
} from "./gravity.js";

export class DebrisController {
	model: DebrisModel = new DebrisModel();

	spawnDebris() {
		return this.model.newDebris();
	}

	collision(p1: ObjectRecord, p2: ObjectRecord) {
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
				p1.vector.y =
					p2.vector.y * (p2.mass / totalMass) +
					p1.vector.y * (p1.mass / totalMass);

				p1.mass += p2.mass;

				p2.vector.x = 0;
				p2.vector.y = 0;
				p2.mass = 0;
			}
		}
	}
}

export class DebrisModel {
	minimumOrbit = 650;
	maximumOrbit = 7_250;

	newDebris() {
		const point: Point = {
			x: Math.max(Math.random() * this.maximumOrbit, this.minimumOrbit),
			y: 0,
		};
		const vector: Vector = calculateCircularOrbit(point);
		const mass = Math.max(2, Number((Math.random() * 100).toFixed(0)));

		const heading: Vector = { x: 0, y: 1 };

		const record: ObjectRecord = {
			type: "debris",

			point,
			vector,

			heading,
			spin: 0,

			mass,
			update,
			complete: (item: ObjectRecord) => {
				if (item.mass < 1) return true;
				return false;
			},
		};

		return record;
	}
}
