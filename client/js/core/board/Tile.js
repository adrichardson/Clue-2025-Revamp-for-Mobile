import { COL_OFFSETS, ROW_OFFSETS } from "../../../../shared/data/index.js";

export class Tile {
  constructor(col, row, tileW, tileH) {
    this.col = col;
    this.row = row;
    this.w = tileW;
    this.h = tileH;
    this.id = `${this.col},${this.row}`;
  }

  /* =========================
     BOARD SPACE (pixel-perfect)
  ========================= */

  get x() {
    return COL_OFFSETS[this.col];
  }

  get y() {
    return ROW_OFFSETS[this.row];
  }

  get rect() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  get center() {
    return {
      x: this.x + this.w / 2,
      y: this.y + this.h / 2
    };
  }

  /* =========================
     WORLD SPACE
  ========================= */

  getWorldRect(origin) {
    return {
      x: origin.x + this.x,
      y: origin.y + this.y,
      w: this.w,
      h: this.h
    };
  }

  getWorldCenter(origin) {
    return {
      x: origin.x + this.x + this.w / 2,
      y: origin.y + this.y + this.h / 2
    };
  }

  /* =========================
     ANIMATED HIGHLIGHT
  ========================= */

  drawHighlight(ctx, origin, time) {
    const r = this.getWorldRect(origin);

    // Pulse: 0 → 1 → 0
    const pulse = 0.5 + Math.sin(time * 4) * 0.5;

    // Fill
    ctx.save();
    ctx.fillStyle = `rgba(0, 255, 120, ${0.2 + pulse * 0.15})`;
    ctx.fillRect(r.x, r.y, r.w, r.h);

    // Glow stroke
    ctx.lineWidth = 2 + pulse * 2;
    ctx.strokeStyle = `rgba(0, 255, 180, ${0.6 + pulse * 0.3})`;
    ctx.shadowBlur = 10 + pulse * 10;
    ctx.shadowColor = "rgba(0,255,180,0.8)";
    ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);

    ctx.restore();
  }

  key() {
    return `${this.col},${this.row}`;
  }
}
