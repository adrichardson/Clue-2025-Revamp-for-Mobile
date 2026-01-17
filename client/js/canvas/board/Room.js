export class Room {
  constructor(id, name, tiles = []) {
    this.id = id;
    this.name = name;
    this.tiles = tiles;
    this.pieces = new Set();

    this._outlineEdges = null;

    // animation state
    this.pulseTime = 0;
  }

  /* =========================
     TILE HELPERS
  ========================= */

  hasTile(col, row) {
    return this.tiles.some(t => t.col === col && t.row === row);
  }

  getTileKeys() {
    return new Set(this.tiles.map(t => t.key()));
  }

  addPiece(piece) {
    this.pieces.add(piece);
  }

  removePiece(piece) {
    this.pieces.delete(piece);
  }

  getPiecesInRoom() {
    const result = [];
    for (const p of this.pieces) {
      result.push(p);
    }
    return result;
  }

  /* =========================
     OUTLINE COMPUTATION
  ========================= */

  getOutlineEdges() {
    if (this._outlineEdges) return this._outlineEdges;

    const tileSet = this.getTileKeys();
    const edges = [];

    for (const tile of this.tiles) {
      const { col, row, x, y, w, h } = tile;

      const neighbors = {
        top:    `${col},${row - 1}`,
        bottom: `${col},${row + 1}`,
        left:   `${col - 1},${row}`,
        right:  `${col + 1},${row}`
      };

      if (!tileSet.has(neighbors.top)) {
        edges.push({ x1: x, y1: y, x2: x + w, y2: y });
      }
      if (!tileSet.has(neighbors.bottom)) {
        edges.push({ x1: x, y1: y + h, x2: x + w, y2: y + h });
      }
      if (!tileSet.has(neighbors.left)) {
        edges.push({ x1: x, y1: y, x2: x, y2: y + h });
      }
      if (!tileSet.has(neighbors.right)) {
        edges.push({ x1: x + w, y1: y, x2: x + w, y2: y + h });
      }
    }

    this._outlineEdges = edges;
    return edges;
  }

  invalidateOutline() {
    this._outlineEdges = null;
  }

  getCenterWorld(boardOrigin) {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const tile of this.tiles) {
      minX = Math.min(minX, tile.x);
      minY = Math.min(minY, tile.y);
      maxX = Math.max(maxX, tile.x + tile.w);
      maxY = Math.max(maxY, tile.y + tile.h);
    }

    return {
      x: boardOrigin.x + (minX + maxX) / 2,
      y: boardOrigin.y + (minY + maxY) / 2
    };
  }

  getBoundsWorld(boardOrigin) {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const tile of this.tiles) {
      minX = Math.min(minX, tile.x);
      minY = Math.min(minY, tile.y);
      maxX = Math.max(maxX, tile.x + tile.w);
      maxY = Math.max(maxY, tile.y + tile.h);
    }

    return {
      x: boardOrigin.x + minX,
      y: boardOrigin.y + minY,
      w: maxX - minX,
      h: maxY - minY
    };
  }  

  /* =========================
     ANIMATION
  ========================= */

  update(dt) {
    this.pulseTime += dt;
  }

  /* =========================
     RENDER
  ========================= */

  drawOutline(ctx, boardOrigin) {
    const edges = this.getOutlineEdges();
    const alpha = 0.6 + Math.sin(this.pulseTime * 0.004) * 0.25;

    ctx.save();
    ctx.translate(boardOrigin.x, boardOrigin.y);

    ctx.strokeStyle = `rgba(0,255,255,${alpha})`;
    ctx.lineWidth = 4;
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 12;

    ctx.beginPath();
    for (const e of edges) {
      ctx.moveTo(e.x1, e.y1);
      ctx.lineTo(e.x2, e.y2);
    }
    ctx.stroke();

    ctx.restore();
  }
}
