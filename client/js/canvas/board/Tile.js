export class Tile {
  constructor(col, row, tileW, tileH) {
    this.col = col;
    this.row = row;
    this.w = tileW;
    this.h = tileH;
  }

  get x() {
    return this.col * this.w;
  }

  get y() {
    return this.row * this.h;
  }

  containsWorld(worldX, worldY) {
    return (
      worldX >= this.x &&
      worldX < this.x + this.w &&
      worldY >= this.y &&
      worldY < this.y + this.h
    );
  }

  key() {
    return `${this.col},${this.row}`;
  }
}
