import { Tile } from "./tile.js";
import { RoomTile } from "./roomTile.js";
import { Room } from "./Room.js";

import {
  TILE_SIZE,
  BOARD_COLS,
  BOARD_ROWS,
  ROOM_DEFS,
  BOARD_ORIGIN_PX,
  COL_OFFSETS,
  ROW_OFFSETS 
} from "./boardData.js";

export class Board {
  constructor() {
    this.origin = BOARD_ORIGIN_PX;
    this.tileSize = TILE_SIZE;

    this.cols = BOARD_COLS;
    this.rows = BOARD_ROWS;
    this.colOffsets = COL_OFFSETS;
    this.rowOffsets = ROW_OFFSETS;

    this.tiles = new Map();       // "c,r" → Tile
    this.roomTiles = new Map();   // "c,r" → RoomTile
    this.rooms = new Map();       // roomId → Room

    this.#buildGrid();
    this.#buildRooms();
  }

  /* =========================
     BUILD
  ========================= */

  #buildGrid() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const tile = new Tile(c, r, this.tileSize.w, this.tileSize.h);
        this.tiles.set(tile.key(), tile);
      }
    }
  }

  #buildRooms() {
    for (const def of ROOM_DEFS) {
      const tiles = [];
      const excludes = new Set(def.excludes || []);
      const doors = new Set(def.doors || []);

      for (let r = def.rect.y; r < def.rect.y + def.rect.h; r++) {
        for (let c = def.rect.x; c < def.rect.x + def.rect.w; c++) {
          const key = `${c},${r}`;
          if (excludes.has(key)) continue;

          const tile = new RoomTile(
            c,
            r,
            this.tileSize.w,
            this.tileSize.h,
            def.id
          );

          if (doors.has(key)) tile.isDoor = true;

          this.roomTiles.set(key, tile);
          tiles.push(tile);
        }
      }

      const room = new Room(def.id, def.name, tiles);
      this.rooms.set(def.id, room);
    }
  }

  /* =========================
     COORD CONVERSION
  ========================= */

  worldToBoard(worldX, worldY) {
    return {
      x: worldX - this.origin.x,
      y: worldY - this.origin.y
    };
  }

  boardToWorld(boardX, boardY) {
    return {
      x: boardX + this.origin.x,
      y: boardY + this.origin.y
    };
  }

  /* =========================
     TILE LOOKUPS
  ========================= */

  getTile(col, row) {
    return this.tiles.get(`${col},${row}`) || null;
  }

  getRoomTile(col, row) {
    return this.roomTiles.get(`${col},${row}`) || null;
  }

  getTileAtWorld(worldX, worldY) {
    const boardX = worldX - this.origin.x;
    const boardY = worldY - this.origin.y;

    let col = -1;
    for (let c = 0; c < this.cols; c++) {
      const x = this.colOffsets[c];
      if (boardX >= x && boardX < x + this.tileSize.w) {
        col = c;
        break;
      }
    }

    let row = -1;
    for (let r = 0; r < this.rows; r++) {
      const y = this.rowOffsets[r];
      if (boardY >= y && boardY < y + this.tileSize.h) {
        row = r;
        break;
      }
    }

    if (col === -1 || row === -1) return null;
    return this.tiles.get(`${col},${row}`) || null;
  }

  /* =========================
     ROOM QUERIES (FIXED)
  ========================= */

  getRoomAtWorld(worldX, worldY) {
    const tile = this.getTileAtWorld(worldX, worldY);
    if (!tile) return null;

    const roomTile = this.roomTiles.get(tile.key());
    if (!roomTile) return null;

    return this.rooms.get(roomTile.roomId) || null;
  }

  getRoomById(id) {
    return this.rooms.get(id) || null;
  }

  /* =========================
     WORLD POS HELPERS
  ========================= */

  getTileWorldRect(col, row) {
    const tile = this.tiles.get(`${col},${row}`);
    if (!tile) return null;

    return {
      x: this.origin.x + tile.x,
      y: this.origin.y + tile.y,
      w: tile.w,
      h: tile.h
    };
  }

  getTileCenterWorld(col, row) {
    const tile = this.tiles.get(`${col},${row}`);
    if (!tile) return null;

    return {
      x: this.origin.x + tile.x + tile.w / 2,
      y: this.origin.y + tile.y + tile.h / 2
    };
  }

  /* =========================
     RULE HELPERS
  ========================= */

  isRoom(col, row) {
    return this.roomTiles.has(`${col},${row}`);
  }

  isDoor(col, row) {
    const tile = this.roomTiles.get(`${col},${row}`);
    return tile ? tile.isDoor : false;
  }

  isWalkable(col, row) {
    if (!this.getTile(col, row)) return false;
    if (this.isRoom(col, row) && !this.isDoor(col, row)) return false;
    return true;
  }
}
