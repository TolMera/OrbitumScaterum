import { CanvasController } from "./canvas.js";
import type { DrawCommand } from "./canvas.js";

import { DebrisController } from "./debris.js";

import { EntryController } from "./entry.js";
import {
	ObjectRecord,
	OrbitSpeedFactor,
	Point,
	Vector,
	calculateCircularOrbit,
	update,
} from "./gravity.js";

export class gamescreenView {
	debris: DebrisController;
	debrisRecords: [ObjectRecord, unknown][] = [];
	canvas: CanvasController;
	_elements: Record<string, any>;
	entry: EntryController;
	set elements(input: Record<string, any>) {
		// Can not set elements twice
		if (this._elements)
			throw new Error("d9111137-23c6-51d9-8cbd-ee51e852bbf5");

		this._elements = input;
	}
	get elements() {
		if (!this._elements) {
			this.elements = this.getElements();
		}
		return this._elements;
	}

	constructor() {
		this.drawBackground();
		this.preloadImages();

		setTimeout(this.drawEarth.bind(this), 5000);
		setTimeout(this.spawnDebris.bind(this), 5000);

		this.animate(0);

		setTimeout(
			function () {
				this.spawnPlayer();
			}.bind(this),
			10000,
		);
	}

	preloadImages() {
		this.preloadEarthImages();
		this.preloadRockImages();
		this.preloadShipImage();
	}

	playerObject: ObjectRecord = this.spawnPlayerModel();
	spawnPlayerModel() {
		const point: Point = {
			x: 5000,
			y: 0,
		};
		const model: ObjectRecord = {
			type: "ship",
			mass: 100,
			point,
			vector: calculateCircularOrbit(point),

			update,
			complete: () => {},
		};
		return model;
	}
	spawnPlayer() {
		const img = this.shipImages[1];
		const scale = 1;

		this.canvas.drawImage(
			img,
			0,
			0,
			scale,
			function (item: DrawCommand, time: number) {
				this.playerObject.update(this.playerObject, time * OrbitSpeedFactor);
				item[1] =
					this.earthPosition.x +
					(this.playerObject.point.x - (img.width / 2) * scale);
				item[2] =
					this.earthPosition.y +
					(this.playerObject.point.y - (img.height / 2) * scale);

				this.entry.simulate(item, time, this.playerObject, [
					// AList of objects with which we are testing Entry
					{
						point: this.earthPosition,
						diameter: this.earthImages[0].width,
					},
				]);

				if (this.playerObject.mass <= 1) {
					this.canvas.ctx.fillStyle = "orange";
					const size = img.width * scale * 2;

					this.canvas.ctx.fillRect(
						item[1] - (img.width * scale) / 2,
						item[2] - (img.width * scale) / 2,
						size,
						size,
					);
				}

				window.scrollTo({
					left: item[1] - (window.innerWidth / 2) + (item[0].width/2),
					top: item[2] - (window.innerHeight / 2) + (item[0].height/2),
				  });
				  
			}.bind(this),
			this.playerObject,
		);
	}

	spawnDebris() {
		const SpawnDebrisRate = 10;
		const MaxDebris = 1000;

		setTimeout(
			this.spawnDebris.bind(this),
			Math.random() * SpawnDebrisRate,
		);

		if (this.debrisRecords.length < MaxDebris) {
			const debrisRecord = this.debris.spawnDebris();
			const img =
				this.rockImages[
					Math.ceil(Math.random() * this.rockImages.length)
				];
			const scale = 0.05 * Math.cbrt(debrisRecord.mass / 10);

			this.canvas.drawImage(
				img,
				this.earthPosition.x + debrisRecord.point.x,
				this.earthPosition.y,
				scale,
				function (item: DrawCommand, time: number) {
					debrisRecord.update(debrisRecord, time * OrbitSpeedFactor);
					item[1] =
						this.earthPosition.x +
						(debrisRecord.point.x - (img.width / 2) * scale);
					item[2] =
						this.earthPosition.y +
						(debrisRecord.point.y - (img.height / 2) * scale);

					this.entry.simulate(item, time, debrisRecord, [
						// AList of objects with which we are testing Entry
						{
							point: this.earthPosition,
							diameter: this.earthImages[0].width,
						},
					]);

					if (debrisRecord.mass <= 1) {
						this.canvas.ctx.fillStyle = "orange";
						const size = img.width * scale * 2;

						this.canvas.ctx.fillRect(
							item[1] - (img.width * scale) / 2,
							item[2] - (img.height * scale) / 2,
							size,
							size,
						);
					}
				}.bind(this),
				debrisRecord,
			);
		}
	}

	lastTimestamp: number = 0;
	animate(time: number) {
		const delta = (time - this.lastTimestamp) / 100;
		this.lastTimestamp = time;
		for (let drawCmd of this.canvas.backgroundDrawList) {
			this.drawIt(drawCmd, delta);
		}
		const deleteList = [];
		for (let drawCmdIndex in this.canvas.drawList) {
			let drawCmd = this.canvas.drawList[drawCmdIndex];
			if (drawCmd[6]) {
				if (drawCmd[6].complete(drawCmd[6])) {
					deleteList.push(drawCmdIndex);
				} else {
					const thisDiam = drawCmd[3]
						// drawCmd[0].width *
						// 0.05 *
						// Math.cbrt(drawCmd[6].mass / 10);
					for (
						let otherIndex = Number(drawCmdIndex) + 1;
						Number(otherIndex) < this.canvas.drawList.length;
						otherIndex++
					) {
						const other = this.canvas.drawList[otherIndex];
						if (other[6] && other[6].type === "debris") {
							const otherDiam = other[3]
								// other[0].width *
								// 0.05 *
								// Math.cbrt(other[6].mass / 10);
							const distance = Math.sqrt(
								Math.pow(other[1] - drawCmd[1], 2) +
								Math.pow(other[2] - drawCmd[2], 2),
							);
							if (distance < otherDiam + thisDiam) {
								const thisPreMass = drawCmd[6].mass;
								const otherPreMass = other[6].mass;
								this.debris.collision(drawCmd[6], other[6]);
								if (thisPreMass < drawCmd[6].mass) {
									drawCmd[3] =
										0.05 * Math.cbrt(drawCmd[6].mass / 10);
									drawCmd[4] = drawCmd[3];
								}
								if (otherPreMass < other[6].mass) {
									other[3] =
										0.05 * Math.cbrt(other[6].mass / 10);
									other[4] = other[3];
								}
							}
						}
					}
					this.drawIt(drawCmd, delta);
				}
			} else {
				this.drawIt(drawCmd, delta);
			}
		}
		for (let index of deleteList) this.canvas.drawList.splice(index, 1);

		if (Math.random() > 0.9)
			console.log(
				"Object Count:",
				this.canvas.drawList.length,
				"background:",
				this.canvas.backgroundDrawList.length,
			);

		requestAnimationFrame(this.animate.bind(this));
	}

	drawIt(drawCmd: DrawCommand, delta: number) {
		let item = drawCmd as unknown as DrawCommand;
		const fn: Function = item[5] as unknown as Function;
		fn(item, delta);
		// @ts-ignore
		this.canvas.ctx.drawImage(...item.slice(0, 5));
	}

	getElements(): {
		canvas: CanvasController;
		debris: DebrisController;
		entry: EntryController;
	} {
		const canvas = (this.canvas = new CanvasController());
		const debris = (this.debris = new DebrisController());
		const entry = (this.entry = new EntryController());
		return {
			canvas,
			debris,
			entry,
		};
	}

	drawBackground() {
		this.elements.canvas.drawBackground(
			"/media/constelation.background.png",
		);
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
			fn,
		);
		console.log("Draw Earth");
	}

	preloadEarthImages() {
		const framePath = "/media/earth/frame-";
		for (let i = 0; i < 20; i++) {
			const index = i;
			const earthImages = this.earthImages;
			const img = this.elements.canvas.getImage(
				`${framePath}${index.toString().padStart(2, "0")}.png`,
			);
			img.onload = () => {
				earthImages[index] = img;
			};
		}
	}

	rockImages: HTMLImageElement[] = [];
	preloadRockImages() {
		const framePath = "/media/rocks/";
		for (let i = 1; i <= 10; i++) {
			const index = i;
			const rockImages = this.rockImages;
			const img = this.elements.canvas.getImage(
				`${framePath}${index.toString()}.png`,
			);
			img.onload = function () {
				this.rockImages[index] = img;
			}.bind(this);
		}
	}

	shipImages: HTMLImageElement[] = [];
	preloadShipImage() {
		const framePath = "/media/ship/ship";
		const img = this.elements.canvas.getImage(`${framePath}1.png`);
		img.onload = function () {
			this.shipImages[1] = img;
		}.bind(this);
	}
}

try {
	new gamescreenView();
} catch (error: unknown) {
	console.error(error);
}
