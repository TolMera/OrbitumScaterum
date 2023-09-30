export type DrawCommand = [CanvasImageSource, number, number , number, number, Function];
export type Point = {x: number; y: number;}

export class CanvasController {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    drawList: DrawCommand[] = [];
    backgroundDrawList: DrawCommand[] = [];

    constructor() {
        this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        this.canvas.width = 1920*8;
        this.canvas.height = 1920*8;
    }
    
    drawImage(filePath: string, x: number, y: number, scale?: number) {
        const img = this.getImage(filePath);
        x -= img.width/2
        y -= img.height/2
        const drawCmd: DrawCommand = [img, x, y, 0, 0, function(){}];
    
        img.onload = () => {
            const width = img.width * (scale || 1);
            const height = img.height * (scale || 1);
            drawCmd[3] = width;
            drawCmd[4] = height;
            this.drawList.push(drawCmd);
        };

        return drawCmd;
    }

    drawBackground(filePath: string): void {
        const img = this.getImage(filePath);
    
        img.onload = () => {
            this.backgroundDrawList.push(
                [
                    img, 0-this.canvas.width, 0, this.canvas.width, this.canvas.height,
                    function(item: DrawCommand, time: number) {
                        // @ts-ignore
                        item[1] += time;
                        if (item[1] > 0) item[1] = 0-this.canvas.width;
                        // @ts-ignore
                        this.ctx.drawImage(...item.slice(0,5));
                    }.bind(this)
                ],
                [
                    img, 0, 0, this.canvas.width, this.canvas.height,
                    function(item: DrawCommand, time: number) {
                        // @ts-ignore
                        item[1] += time;
                        if (item[1] > this.canvas.width) item[1] = 0;
                        // @ts-ignore
                        this.ctx.drawImage(...item.slice(0,5));
                    }.bind(this)
                ]
            );
        };
    }

    currentPoint: Point = {x: 0, y: 0};
    lookAtPoint(input: Point) {
        this.ctx.translate(0-this.currentPoint.x, 0-this.currentPoint.y);
        this.currentPoint = input;
        this.ctx.translate(input.x, input.y);
    }

    getImage(filePath: string) {
        const img = new Image();
        img.src = filePath;
        return img;
    }
}
