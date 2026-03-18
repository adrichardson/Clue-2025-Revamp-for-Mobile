import { state } from "../gameState.js";

let ctx, canvasWidth, canvasHeight;

export function initRenderer(_ctx, w, h) {
  ctx = _ctx;
  canvasWidth = w;
  canvasHeight = h;
}

export function redraw() {
  if (!ctx) return;
  draw(ctx, canvasWidth, canvasHeight);
}

function draw(ctx, w, h) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.translate(state.camera.x, state.camera.y);
  ctx.scale(state.camera.scale, state.camera.scale);

  if (state.imageLoaded) {
    ctx.drawImage(state.boardImage, 0, 0);
  }

  if (state.debug.showTiles) {
    drawTileDebug(ctx, state.board);
  }

  if (state.debug.showRooms) {
    drawRoomDebug(ctx, state.board);
  }

  if (state.debug.hoveredTile) {
    state.debug.hoveredTile.drawHighlight(
      ctx,
      state.board.origin,
      performance.now() / 1000
    );
  }

  for (const piece of state.pieces.values()) {
    drawPiece(piece);
  }    

  if (state.debug.hoveredRoom) {
    state.debug.hoveredRoom.update(1 / 60);
    state.debug.hoveredRoom.drawOutline(ctx, state.board.origin);
  }

  ctx.restore();
}

function drawPiece(piece) {
  const BORDER = 2;

  // --- Fill ---
  ctx.beginPath();
  ctx.arc(piece.x, piece.y, piece.radius, 0, Math.PI * 2);
  ctx.fillStyle = piece.color;
  ctx.fill();

  // --- Inner border ---
  ctx.beginPath();
  ctx.arc(
    piece.x,
    piece.y,
    piece.radius - BORDER / 2, // keep stroke inside
    0,
    Math.PI * 2
  );
  ctx.strokeStyle = "rgba(0,0,0,0.9)";
  ctx.lineWidth = BORDER;
  ctx.stroke();
}
