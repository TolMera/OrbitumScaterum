import type { Point } from "./canvas";

export class DebrisController {
    model: DebrisModel = new DebrisModel;

    spawnDebris() {
        return this.model.newDebris();
    }
}

type Vector = Point;

const G = 6.67430e-11;
const M = 5.972e24;

export type DebrisRecord = {
    point: Point,
    vector: Vector,
    speed: number,
    update: Function
};

export class DebrisModel {
    minimumOrbit = 1_000;
    maximumOrbit = 7_250;
    
    newDebris() {
        const point: Point = {
            x: Math.max(Math.random() * this.maximumOrbit, this.minimumOrbit),
            y: 0,
        };
        const vector: Vector = {
            x: 0,
            y: Math.sqrt(G * M / Math.abs(point.x))
        };
        const speed: number = G * M / (point.x - 7680);
        const update = function (time: number) {
          const r = Math.sqrt(point.x * point.x + point.y * point.y);
          const a = G * M / (r * r);
          
          // Update velocity using acceleration
          vector.x += (-a * point.x / r) * time;
          vector.y += (-a * point.y / r) * time;
          
          // Update position using velocity
          point.x += vector.x * time;
          point.y += vector.y * time;
        }
        
        const record = {
            point,
            vector,
            speed,
            update
        };

        return record;
    }
}
