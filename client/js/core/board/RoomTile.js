import { Tile } from "./tile.js";

export class RoomTile extends Tile {
  constructor(col, row, w, h, roomId) {
    super(col, row, w, h);
    this.roomId = roomId;
    this.isDoor = false;
  }
}
