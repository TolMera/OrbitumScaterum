import {CanvasController} from './canvas.js';
import type {DrawCommand} from "./canvas.js"

export class gamescreenView {
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
        setTimeout(this.drawEarth.bind(this), 1000);

        this.animate(0);
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

    getElements(): {canvas: CanvasController} {
        return {
            canvas: this.canvas = new CanvasController()
        }
    }

    drawBackground() {
        this.elements.canvas.drawBackground('/media/constelation.background.png');
    }

    earthSecondsToRotation: number = 0;
    earthSecondsPassed: number = 0;
    earthFrame: number = 0;
    earthImages: HTMLImageElement[] = [];
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

        this.elements.canvas.drawImage("/media/earth/frame-00.png", 7680, 7680, 1, fn);
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
}

try {
    new gamescreenView();
} catch (error: unknown) {
    console.error(error);
}