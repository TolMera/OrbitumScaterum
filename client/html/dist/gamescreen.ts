import { CanvasController } from './canvas.js';
import type { DrawCommand, Point } from "./canvas.js"

import { DebrisController } from './debris.js';
import type { DebrisRecord } from './debris.js';

import { EntryController } from './entry.js';

export class gamescreenView {
    debris: DebrisController;
    debrisRecords: [DebrisRecord, unknown][] = [];
    canvas: CanvasController;
    _elements: Record<string, any>;
    entry: EntryController;
    set elements(input: Record<string, any>) {
        // Can not set elements twice
        if (this._elements) throw new Error("d9111137-23c6-51d9-8cbd-ee51e852bbf5");

        this._elements = input;
    }
    get elements() {
        if (!this._elements) { this.elements = this.getElements(); }
        return this._elements;
    }

    constructor() {
        this.drawBackground();
        this.preloadEarthImages();
        setTimeout(this.drawEarth.bind(this), 5000);

        this.preloadRockImages();
        setTimeout(this.spawnDebris.bind(this), 5000);

        this.animate(0);
    }

    spawnDebris() {
        const SpawnDebrisRate = 10;
        const MaxDebris = 100000;
        const OrbitSpeedFactor = 0.00005;

        setTimeout(
            this.spawnDebris.bind(this),
            Math.random() * SpawnDebrisRate
        );

        if (this.debrisRecords.length < MaxDebris) {
            const debrisRecord = this.debris.spawnDebris();
            const img = this.rockImages[Math.ceil(Math.random() * this.rockImages.length)];

            this.canvas.drawImage(
                img,
                this.earthPosition.x + debrisRecord.point.x,
                this.earthPosition.y,
                .05 * Math.max(Math.random(), 0.5),
                function (item: DrawCommand, time: number) {
                    debrisRecord.update(time * OrbitSpeedFactor);
                    item[1] = this.earthPosition.x + debrisRecord.point.x;
                    item[2] = this.earthPosition.y + debrisRecord.point.y;

                    this.entry.simulate(
                        item,
                        time,
                        debrisRecord,
                        [ // AList of objects with which we are testing Entry
                            { point: this.earthPosition, diameter: this.earthImages[0].width }
                        ]
                    );

                    if (debrisRecord.mass < 1) {
                        const recordRecord: [DebrisRecord, unknown] = this.debrisRecords.find((hay:[DebrisRecord, unknown]) => hay[0] === debrisRecord);
                        let recordFlag = -1;
                        for (const recordIndex of this.debrisRecords) {
                            if (this.debrisRecords[recordIndex] === debrisRecord) {
                                recordFlag = recordIndex;
                                let drawFlag: number = -1;
                                for (const drawIndex in this.canvas.drawList) {
                                    if (this.canvas.drawList[drawIndex] === recordRecord[1]) {
                                        drawFlag = Number(drawIndex);
                                        break;
                                    }
                                }
                                if (drawFlag !== -1) this.canvas.drawList.splice(drawFlag, 1);
                                break;
                            }
                        }
                        if (recordFlag === -1) this.debrisRecords.splice(recordFlag, 1);
                    }
                }.bind(this)
            );

            this.debrisRecords.push([
                debrisRecord,
                this.canvas.drawList[this.canvas.drawList.length - 1]
            ]);
        }
    }

    lastTimestamp: number = 0;
    animate(time: number) {
        const delta = (time - this.lastTimestamp) / 100;
        this.lastTimestamp = time;
        for (let drawCmd of this.canvas.backgroundDrawList) {
            this.drawIt(drawCmd, delta);
        }
        for (let drawCmd of this.canvas.drawList) {
            this.drawIt(drawCmd, delta);
        }

        // console.log("Object Count:", this.canvas.drawList.length, "background:", this.canvas.backgroundDrawList.length);

        requestAnimationFrame(this.animate.bind(this));
    }

    drawIt(drawCmd: DrawCommand, delta: number) {
        let item = drawCmd as unknown as DrawCommand;
        const fn: Function = item.slice(-1)[0] as unknown as Function;
        fn(item, delta);
        // @ts-ignore
        this.canvas.ctx.drawImage(...item.slice(0, 5));
    };

    getElements(): {
        canvas: CanvasController;
        debris: DebrisController;
        entry: EntryController;
    } {
        const canvas = this.canvas = new CanvasController();
        const debris = this.debris = new DebrisController();
        const entry = this.entry = new EntryController();
        return {
            canvas,
            debris,
            entry,
        }
    }

    drawBackground() {
        this.elements.canvas.drawBackground('/media/constelation.background.png');
    }

    earthSecondsToRotation: number = 0;
    earthSecondsPassed: number = 0;
    earthFrame: number = 0;
    earthImages: HTMLImageElement[] = [];
    earthPosition: Point = { x: 7680, y: 7680 };
    drawEarth() {
        this.earthSecondsToRotation = this.elements.canvas.canvas.width / 20;

        const fn = function (item: DrawCommand, time: number) {
            this.earthSecondsPassed += time;
            if (this.earthSecondsPassed > this.earthSecondsToRotation) {
                if (++this.earthFrame > 19) this.earthFrame = 0;
                this.earthSecondsPassed -= this.earthSecondsToRotation;
                item[0] = this.earthImages[this.earthFrame];
            }
        }.bind(this);

        this.elements.canvas.drawImage(
            this.earthImages[0],
            this.earthPosition.x,
            this.earthPosition.y,
            1,
            fn
        );
        console.log("Draw Earth");
    }

    preloadEarthImages() {
        const framePath = "/media/earth/frame-";
        for (let i = 0; i < 20; i++) {
            const index = i;
            const earthImages = this.earthImages;
            const img = this.elements.canvas.getImage(`${framePath}${index.toString().padStart(2, "0")}.png`);
            img.onload = () => { earthImages[index] = img; }
        }
    }

    rockImages: HTMLImageElement[] = [];
    preloadRockImages() {
        const framePath = "/media/rocks/";
        for (let i = 1; i <= 10; i++) {
            const index = i;
            const rockImages = this.rockImages;
            const img = this.elements.canvas.getImage(`${framePath}${index.toString()}.png`);
            img.onload = () => { rockImages[index] = img; }
        }
    }
}

try {
    new gamescreenView();
} catch (error: unknown) {
    console.error(error);
}