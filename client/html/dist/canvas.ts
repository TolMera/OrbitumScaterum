import { ObjectRecord, Point } from "./gravity.js";

export type DrawCommand = [
	HTMLImageElement,
	number,
	number,
	number,
	number,
	Function,
	any?,
];

export class CanvasController {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	drawList: DrawCommand[] = [];
	backgroundDrawList: DrawCommand[] = [];

	constructor() {
		this.canvas = document.getElementById(
			"gameCanvas",
		) as HTMLCanvasElement;
		this.ctx = this.canvas.getContext("2d")!;
		this.resizeCanvas();
	}

	resizeCanvas() {
		this.canvas.width = 1920 * 8;
		this.canvas.height = 1920 * 8;
	}

	drawImage(
		filePath: string | HTMLImageElement,
		x: number,
		y: number,
		scale: number = 1,
		fn: Function = () => {},
		model?: ObjectRecord,
	): DrawCommand {
		const img =
			typeof filePath === "string" ? this.getImage(filePath) : filePath;
		if (img) {
			x -= img.width / 2;
			y -= img.height / 2;

			const cmd: DrawCommand = [
				img,
				x,
				y,
				img.width * scale,
				img.height * scale,
				fn,
				model,
			];

			img.onload = () => {
				cmd[0] = img;
			};
			this.drawList.push(cmd);

			return cmd;
		} else {
			// TODO Fix this bug WD74
			// setTimeout(console.log.bind(this,img), 100);
		}
	}

	drawBackground(filePath: string): void {
		const img = this.getImage(filePath);

		img.onload = () => {
			this.backgroundDrawList.push(
				[
					img,
					0 - this.canvas.width,
					0,
					this.canvas.width,
					this.canvas.height,
					function (item: DrawCommand, time: number) {
						item[1] += time;
						if (item[1] > 0) item[1] = 0 - this.canvas.width;
						this.ctx.drawImage(...item.slice(0, 5));
					}.bind(this),
				],
				[
					img,
					0,
					0,
					this.canvas.width,
					this.canvas.height,
					function (item: DrawCommand, time: number) {
						item[1] += time;
						if (item[1] > this.canvas.width) item[1] = 0;
						this.ctx.drawImage(...item.slice(0, 5));
					}.bind(this),
				],
			);
		};
	}

	currentPoint: Point = { x: 0, y: 0 };
	lookAtPoint(input: Point) {
		this.ctx.translate(0 - this.currentPoint.x, 0 - this.currentPoint.y);
		this.currentPoint = input;
		this.ctx.translate(input.x, input.y);
	}

	getImage(filePath: string) {
		const img = new Image();
		img.src = filePath;
		return img;
	}
}
