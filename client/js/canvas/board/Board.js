import { Tile } from "./tile.js";
import { RoomTile } from "./roomTile.js";
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
    this.origin = BOARD_ORIGIN_PX;   // pixel-perfect board offset
    this.tileSize = TILE_SIZE;

    this.cols = BOARD_COLS;
    this.rows = BOARD_ROWS;
    this.colOffsets = COL_OFFSETS;
    this.rowOffsets = ROW_OFFSETS;

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

      this.rooms.set(def.id, {
        id: def.id,
        name: def.name,
        tiles
      });
    }
  }

  /* =========================
     COORD CONVERSION (CORE)
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

    getTileCenterWorld(col, row) {
        const tile = this.tiles.get(`${col},${row}`);
        if (!tile) return null;

        return {
            x: this.origin.x + tile.x + tile.w / 2,
            y: this.origin.y + tile.y + tile.h / 2
        };
    }  

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

  worldToTile(worldX, worldY) {
    const { x, y } = this.worldToBoard(worldX, worldY);

    const col = Math.floor(x / this.tileSize.w);
    const row = Math.floor(y / this.tileSize.h);

    if (
      col < 0 || col >= this.cols ||
      row < 0 || row >= this.rows
    ) {
      return null;
    }

    return { col, row };
  }

    tileToWorld(tile) {
    return {
        x: this.origin.x + tile.x,
        y: this.origin.y + tile.y
    };
    }

    tileToWorldCenter(tile) {
    return {
        x: this.origin.x + tile.x + tile.w / 2,
        y: this.origin.y + tile.y + tile.h / 2
    };
    }

  tileToWorldRect(col, row) {
    return {
      x: this.origin.x + col * this.tileSize.w,
      y: this.origin.y + row * this.tileSize.h,
      w: this.tileSize.w,
      h: this.tileSize.h
    };
  }

  /* =========================
     QUERIES (THIS IS GOLD ✨)
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

    for (const tile of this.tiles.values()) {
        if (tile.containsBoard(boardX, boardY)) {
        return tile;
        }
    }

    return null;
    }


  getRoomAtWorld(worldX, worldY) {
    const tile = this.worldToTile(worldX, worldY);
    if (!tile) return null;
    return this.getRoomTile(tile.col, tile.row);
  }

  getRoomById(id) {
    return this.rooms.get(id);
  }

  /* =========================
     RULE HELPERS (FUTURE-PROOF)
  ========================= */

  isRoom(col, row) {
    return this.roomTiles.has(`${col},${row}`);
  }

  isDoor(col, row) {
    const tile = this.roomTiles.get(`${col},${row}`);
    return tile ? tile.isDoor : false;
  }

  isWalkable(col, row) {
    // hallway or door tiles only
    if (!this.getTile(col, row)) return false;
    if (this.isRoom(col, row) && !this.isDoor(col, row)) return false;
    return true;
  }
}
