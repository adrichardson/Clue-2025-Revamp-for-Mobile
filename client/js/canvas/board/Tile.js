import { COL_OFFSETS, ROW_OFFSETS } from "./boardData.js";

export class Tile {
  constructor(col, row, tileW, tileH) {
    this.col = col;
    this.row = row;
    this.w = tileW;
    this.h = tileH;
  }

  // Local board-space X (pixel-perfect)
  get x() {
    return COL_OFFSETS[this.col];
  }

  // Local board-space Y (pixel-perfect)
  get y() {
    return ROW_OFFSETS[this.row];
  }

  // Board-space bounds check (NOT world-space)
  containsBoard(boardX, boardY) {
    return (
      boardX >= this.x &&
      boardX < this.x + this.w &&
      boardY >= this.y &&
      boardY < this.y + this.h
    );
  }

  key() {
    return `${this.col},${this.row}`;
  }
}
