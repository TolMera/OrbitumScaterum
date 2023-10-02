import { DrawCommand } from "./canvas.js";
import { ObjectRecord, Point } from "./gravity.js";

export class EntryController {
	simulate(
		item: DrawCommand,
		time: number,
		record: ObjectRecord,
		bodies: { point: Point; diameter: number }[],
	) {
		const BurnupStartsAt = 2;
		if (record.mass < 1) return;

		const distance =
			record.point.x * record.point.x + record.point.y * record.point.y;
		for (const body of bodies) {
			const radius = Math.pow(body.diameter / 2, 2);
			const atmoRadius = radius * BurnupStartsAt - radius;
			if (distance < radius) {
				record.mass = 0.1;
			}
			if (distance - radius < atmoRadius) {
				const depth = distance - radius;
				const burnRate =
					Math.abs((depth - atmoRadius) / -atmoRadius) / 10;
				record.mass *= 1 - burnRate * time;

				// Calculate magnitude of current vector
				const magnitude = Math.sqrt(
					record.vector.x ** 2 + record.vector.y ** 2,
				);

				// Apply burn rate
				const newMagnitude = magnitude * (1 - (burnRate / 50) * time);

				// Calculate new vector components
				const scalingFactor = newMagnitude / magnitude;
				record.vector.x *= scalingFactor;
				record.vector.y *= scalingFactor;
			}
		}
	}
}
