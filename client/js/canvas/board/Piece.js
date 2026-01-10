export class Piece {
  constructor(startTile, color) {
    this.startTile = startTile;
    this.color = color;
    this.x = startTile.x;
    this.y = startTile.y;
  }

  get x() {
    return this.x;
  }

  get y() {
    return this.y;
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
