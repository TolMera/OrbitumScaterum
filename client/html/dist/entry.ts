import { DrawCommand, Point } from "./canvas";
import type { DebrisRecord } from "./debris";

export class EntryController {
    simulate(
        item: DrawCommand,
        time: number,
        record: DebrisRecord,
        bodies: { point: Point, diameter: number }[]
    ) {
        const OverrideBurnupStartsAt = 100;
        const BurnupStartsAt = OverrideBurnupStartsAt || 1.1;
        if (record.mass < 1) return;

        const distance = Math.sqrt(Math.abs(record.point.x * record.point.x) + Math.abs(record.point.y * record.point.y));
        for (const body of bodies) {
            const radius = body.diameter / 2;
            if (distance < radius * BurnupStartsAt) {
                const depth = distance - radius;
                const burnRate = Math.max(0.01, Math.min(1, ((depth-(radius*.1))/-(radius*.1))));
                const preWeight = record.mass;
                record.mass = Number((record.mass * (1-(burnRate*time))).toFixed(4));
                const postWeight = record.mass;
                if (preWeight !== Infinity && postWeight === Infinity) console.log("bf35acce-8ee8-5bb5-a5f3-21b85b286036", preWeight, postWeight, 1-(burnRate*time));

                if (record.mass < 1) console.log("Burned up");
            }
        }
    }
}