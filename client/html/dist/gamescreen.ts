import {CanvasController} from './canvas.js';
import type {DrawCommand, Point} from "./canvas.js"

import { DebrisController } from './debris.js';
import type { DebrisRecord } from './debris.js';

export class gamescreenView {
    debris: DebrisController;
    debrisRecords: [DebrisRecord, unknown][] = [];
    canvas: CanvasController;
    _elements: Record<string, any>;
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
        setTimeout(this.spawnDebris.bind(this), Math.random()*1000);
        const debrisRecord = this.debris.spawnDebris();
        const img = this.rockImages[Math.ceil(Math.random()*10)];
        this.canvas.drawImage(
            img,
            this.earthPosition.x + debrisRecord.point.x,
            this.earthPosition.y,
            .05,
            function(item: DrawCommand, time: number) {
                debrisRecord.update(time*.001);
                item[1] = this.earthPosition.x + debrisRecord.point.x;
                item[2] = this.earthPosition.y + debrisRecord.point.y;
            }.bind(this)
        );

        this.debrisRecords.push([
            debrisRecord,
            this.canvas.drawList[this.canvas.drawList.length-1]
        ]);
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

        requestAnimationFrame(this.animate.bind(this));
    }

    drawIt(drawCmd:DrawCommand, delta: number) {
        let item = drawCmd as unknown as DrawCommand;
        const fn:Function = item.slice(-1)[0] as unknown as Function;
        fn(item, delta);
        // @ts-ignore
        this.canvas.ctx.drawImage(...item.slice(0,5));
    };

    getElements(): {canvas: CanvasController, debris: DebrisController} {
        const canvas = this.canvas = new CanvasController();
        const debris = this.debris = new DebrisController();
        return {
            canvas,
            debris,
        }
    }

    drawBackground() {
        this.elements.canvas.drawBackground('/media/constelation.background.png');
    }

    earthSecondsToRotation: number = 0;
    earthSecondsPassed: number = 0;
    earthFrame: number = 0;
    earthImages: HTMLImageElement[] = [];
    earthPosition: Point = {x: 7680, y: 7680};
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