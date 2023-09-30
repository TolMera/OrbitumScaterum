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

type DebrisRecord = {
    point: Point,
    vector: Vector,
    speed: number,
    update: Function
};

export class DebrisModel {
    records: DebrisRecord[] = [];

    minimumOrbit = 13_000;
    maximumOrbit = 750_000;
    
    newDebris() {
        const point: Point = {
            x: Math.max(Math.random() * this.maximumOrbit, this.minimumOrbit),
            y: 0,
        };
        const vector: Vector = {
            x: 0,
            y: Math.sqrt(G * M / Math.abs(point.x))
        };
        const speed: number = G * M / point.x;
        const update = function (item, time) {
          const r = Math.sqrt(item.point.x * item.point.x + item.point.y * item.point.y);
          const a = G * M / (r * r);
          
          // Update velocity using acceleration
          item.vector.x += (-a * item.point.x / r) * time;
          item.vector.y += (-a * item.point.y / r) * time;
          
          // Update position using velocity
          item.point.x += item.vector.x * time;
          item.point.y += item.vector.y * time;
        }
        
        const record = {
            point,
            vector,
            speed,
            update
        };

        this.records.push(record);
        return record;
    }
}
