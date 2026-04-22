import { showToast } from "./utils.js";
import { redraw } from "./renderer.js";

export function setupInput(canvas, state, onPointerDown) {
  const pointers = new Map();

  let lastPinchDistance = null;
  let lastPinchMidpoint = null;

  let isPCPanning = false;
  let lastPanPos = null;

  /* =========================
     COORD CONVERSIONS
  ========================= */

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function getWorldCoords(e) {
    const { x, y } = getCanvasCoords(e);
    return {
      worldX: (x - state.camera.x) / state.camera.scale,
      worldY: (y - state.camera.y) / state.camera.scale
    };
  }

  /* =========================
     POINTER DOWN
  ========================= */

  canvas.addEventListener("pointerdown", e => {

    if (onPointerDown) {
      const canvasPos = getCanvasCoords(e);
      const { worldX, worldY } = getWorldCoords(e);

      const consumed = onPointerDown({
        canvasX: canvasPos.x,
        canvasY: canvasPos.y,
        worldX,
        worldY,
        event: e
      });
      if (consumed) return;
    }    
  
    // ---- ALT / PC PAN START ----
    if (e.altKey && pointers.size === 0) {
      isPCPanning = true;
      lastPanPos = getCanvasCoords(e);

      // 🔑 Clear pinch state when entering single-finger pan
      lastPinchDistance = null;
      lastPinchMidpoint = null;

      pointers.set(e.pointerId, e);
      return;
    }

    pointers.set(e.pointerId, e);

    if (pointers.size !== 1) return;

    const { worldX, worldY } = getWorldCoords(e);

    for (const piece of state.pieces.values()) {
      if (piece.containsWorld(worldX, worldY)) {
        piece.beginDrag(e.pointerId);
        break;
      }
    }
  });

  /* =========================
     MOUSE WHEEL ZOOM
  ========================= */

  canvas.addEventListener(
    "wheel",
    event => {
      event.preventDefault();

      const { x, y } = getCanvasCoords(event);

      const ZOOM_SPEED = 0.0015; // sane, stable zoom
      const factor = 1 - event.deltaY * ZOOM_SPEED;

      state.camera.zoomAtPoint(factor, x, y);
      state.camera.clampToImage(canvas, state.boardImage);
      redraw();
    },
    { passive: false }
  );

  /* =========================
     POINTER MOVE
  ========================= */

  canvas.addEventListener("pointermove", e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, e);

    /* =========================
       DRAG PIECE
    ========================= */

    for (const piece of state.pieces.values()) {
      if (
        piece.dragging &&
        piece.dragPointerId === e.pointerId
      ) {
          const board = state.board;
          const { worldX, worldY } = getWorldCoords(e);

          const tile = board.getTileAtWorld(worldX, worldY);
          const room = board.getRoomAtWorld(worldX, worldY);

          if (room) {
            state.debug.hoveredRoom = room;
            showToast(room.name);
          } else {
            state.debug.hoveredRoom = null;
          }

          if (tile && !board.isRoom(tile.col, tile.row)) {
            state.debug.hoveredTile = tile;
            showToast(`Hallway ${tile.col},${tile.row}`);
          } else {
            state.debug.hoveredTile = null;
          }

          piece.x = worldX;
          piece.y = worldY;

          redraw();
          return;
        }
    }

    /* =========================
       SINGLE-FINGER PAN (PC / ALT)
    ========================= */

    if (isPCPanning && pointers.size === 1) {
      const pos = getCanvasCoords(e);

      const dx = pos.x - lastPanPos.x;
      const dy = pos.y - lastPanPos.y;

      state.camera.x += dx;
      state.camera.y += dy;

      lastPanPos = pos;

      state.camera.clampToImage(canvas, state.boardImage);
      redraw();
      return;
    }

    /* =========================
       PINCH PAN + ZOOM (MOBILE)
    ========================= */

    if (pointers.size === 2) {
      const pts = [...pointers.values()];
      const p0 = getCanvasCoords(pts[0]);
      const p1 = getCanvasCoords(pts[1]);

      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p1.y) / 2;

      const dx = p0.x - p1.x;
      const dy = p0.y - p1.y;
      const dist = Math.hypot(dx, dy);

      if (lastPinchMidpoint) {
        state.camera.x += midX - lastPinchMidpoint.x;
        state.camera.y += midY - lastPinchMidpoint.y;
      }

      if (lastPinchDistance) {
        state.camera.zoomAtPoint(dist / lastPinchDistance, midX, midY);
      }

      lastPinchDistance = dist;
      lastPinchMidpoint = { x: midX, y: midY };

      state.camera.clampToImage(canvas, state.boardImage);
      redraw();
    }
  });

  /* =========================
     POINTER END
  ========================= */

  canvas.addEventListener("pointerup", endGesture);
  canvas.addEventListener("pointercancel", endGesture);

  function endGesture(e) {
    pointers.delete(e.pointerId);

    // ---- STOP PC PAN ----
    if (isPCPanning) {
      isPCPanning = false;
      lastPanPos = null;
    }

    // ---- CLEAR PINCH STATE WHEN < 2 POINTERS ----
    if (pointers.size < 2) {
      lastPinchDistance = null;
      lastPinchMidpoint = null;
    }

    /* =========================
       SNAP PIECES
    ========================= */

    if( state.pieces) {
      for (const piece of state.pieces.values()) {
        if (piece.dragPointerId === e.pointerId) {
          piece.endDrag();

          const cx = piece.x;
          const cy = piece.y;

          const tile = state.board.getTileAtWorld(cx, cy);
          const room = state.board.getRoomAtWorld(cx, cy);

          if (tile && !room) {
            piece.tile = tile;
            piece.snapToTile(state.board.origin); //contains room removal
            state.debug.hoveredTile = null;
     
          } else if (room && room.canEnter) {
            room.addPiece(piece);
            piece.room = room;
            piece.snapToRoom(room, state.board.origin); //contains tile removal
            state.debug.hoveredRoom = null;
          } else {
            piece.tile !== null ? piece.snapToTile(state.board.origin) : piece.snapToRoom(piece.room, state.board.origin);
            state.debug.hoveredTile = null;
            state.debug.hoveredRoom = null;
          }
        }
      }
    }

    state.camera.clampToImage(canvas, state.boardImage);
    redraw();
  }
}