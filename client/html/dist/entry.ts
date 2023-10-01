import { DrawCommand, Point } from "./canvas";
import type { DebrisRecord } from "./debris";

export class EntryController {
    simulate(
        item: DrawCommand,
        time: number,
        record: DebrisRecord,
        bodies: { point: Point, diameter: number }[]
    ) {
        const OverrideBurnupStartsAt = undefined;
        const BurnupStartsAt = OverrideBurnupStartsAt || 1.2;
        if (record.mass < 1) return;

        const distance = Math.abs(record.point.x * record.point.x) + Math.abs(record.point.y * record.point.y);
        for (const body of bodies) {
            const radius = Math.pow(body.diameter / 2, 2);
            const atmoRadius = (radius * BurnupStartsAt);
            if (distance < radius) {
                record.mass = 0.1;
            }
            else if (distance < atmoRadius) {
                const depth = distance - atmoRadius;
                const burnRate = Math.max(0.01, Math.min(1, ((depth-atmoRadius)/-atmoRadius)));
                record.mass = Number((record.mass * (1-(burnRate*time))).toFixed(4));

                if (record.mass < 1) {
                    console.log("Burned up");
                }
            }
        }
    }
}