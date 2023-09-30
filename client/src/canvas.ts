const canvas: HTMLCanvasElement = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function drawImage(filePath: string, x: number, y: number, scale?: number) {
    const img = new Image();
    img.src = filePath;
  
    img.onload = () => {
      const width = img.width * (scale || 1);
      const height = img.height * (scale || 1);
      ctx.drawImage(img, x, y, width, height);
    };
}
  
