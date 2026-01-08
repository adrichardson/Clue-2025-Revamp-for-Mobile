// utils/camera.js
export class Camera {
  constructor({ x = 0, y = 0, scale = 1, minScale = 1, maxScale = 3 } = {}) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.minScale = minScale;
    this.maxScale = maxScale;
  }

  zoomAtPoint(factor, canvasX, canvasY) {
    // stabilize pinch
    factor = Math.max(0.9, Math.min(1.1, factor));

    const worldX = (canvasX - this.x) / this.scale;
    const worldY = (canvasY - this.y) / this.scale;

    const newScale = Math.max(
      this.minScale,
      Math.min(this.maxScale, this.scale * factor)
    );

    this.x = canvasX - worldX * newScale;
    this.y = canvasY - worldY * newScale;
    this.scale = newScale;
  }

  clampToImage(canvas, image) {
    const scaledW = image.width * this.scale;
    const scaledH = image.height * this.scale;

    // Horizontal
    if (scaledW <= canvas.width) {
      this.x = (canvas.width - scaledW) / 2;
    } else {
      this.x = Math.min(0, Math.max(canvas.width - scaledW, this.x));
    }

    // Vertical
    if (scaledH <= canvas.height) {
      this.y = (canvas.height - scaledH) / 2;
    } else {
      this.y = Math.min(0, Math.max(canvas.height - scaledH, this.y));
    }
  }
}
