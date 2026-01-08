export class Piece {
  constructor(startTile, color) {
    this.col = startTile.col;
    this.row = startTile.row;
    this.w = startTile.w;
    this.h = startTile.h;
    this.color = color;
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
