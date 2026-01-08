import { Tile } from "./tile.js";
import { RoomTile } from "./roomTile.js";
import {
  TILE_SIZE,
  BOARD_COLS,
  BOARD_ROWS,
  ROOM_DEFS,
  BOARD_ORIGIN_PX
} from "./boardData.js";

export class Board {
  constructor() {
    this.origin = BOARD_ORIGIN_PX;
    this.tileSize = TILE_SIZE;

    this.tiles = new Map();       // "x,y" → Tile
    this.roomTiles = new Map();   // "x,y" → RoomTile
    this.rooms = new Map();       // roomId → { id, name, tiles[] }

    this.#buildGrid();
    this.#buildRooms();
  }

  /* =========================
     BUILD
  ========================= */

  #buildGrid() {
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
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

      this.rooms.set(def.id, {
        id: def.id,
        name: def.name,
        tiles
      });
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

  boardToGrid(boardX, boardY) {
    const col = Math.floor(boardX / this.tileSize.w);
    const row = Math.floor(boardY / this.tileSize.h);
    return { col, row };
  }

  /* =========================
     QUERIES (THIS IS GOLD)
  ========================= */

  getTileAtWorld(worldX, worldY) {
    const b = this.worldToBoard(worldX, worldY);
    const g = this.boardToGrid(b.x, b.y);
    return this.tiles.get(`${g.col},${g.row}`) || null;
  }

  getRoomAtWorld(worldX, worldY) {
    const b = this.worldToBoard(worldX, worldY);
    const g = this.boardToGrid(b.x, b.y);
    return this.roomTiles.get(`${g.col},${g.row}`) || null;
  }

  getRoomById(id) {
    return this.rooms.get(id);
  }
}
