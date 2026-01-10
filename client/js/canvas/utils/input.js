import { showToast } from "./utils.js";

export function setupInput(canvas, state, redraw) {
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
    if (e.altKey && pointers.size === 0) {
      isPCPanning = true;
      lastPanPos = getCanvasCoords(e);
      pointers.set(e.pointerId, e);
    } else {
      pointers.set(e.pointerId, e);
    }

    if (pointers.size !== 1) return;

    const { worldX, worldY } = getWorldCoords(e);

    // ---- CIRCLE DRAG ----
    const dx = worldX - state.circle.x;
    const dy = worldY - state.circle.y;

    if (dx * dx + dy * dy <= state.circle.radius ** 2) {
      state.circle.dragging = true;
      state.circle.dragPointerId = e.pointerId;
    }
  });

  /* =========================
     POINTER MOVE
  ========================= */

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();

    const { x, y } = getCanvasCoords(event);

    // Normalize wheel direction
    const ZOOM_SPEED = 5; // tweak to taste
    const factor = 1 - event.deltaY * ZOOM_SPEED;

    state.camera.zoomAtPoint(factor, x, y);
    state.camera.clampToImage(canvas, state.boardImage);
    redraw();
  }, { passive: false });

  canvas.addEventListener("pointermove", e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, e);

    // ---- DRAG CIRCLE ----
    if (state.circle.dragging && state.circle.dragPointerId === e.pointerId && pointers.size === 1) {
      const board = state.board;
      const { worldX, worldY } = getWorldCoords(e);

      const tile = board.getTileAtWorld(worldX, worldY);
      state.debug.hoveredTile = tile;            
      const roomTile = board.getRoomAtWorld(worldX, worldY);

      if (roomTile) {
        showToast(roomTile.roomId);
      } else if (tile) {
        showToast(`Hallway ${tile.col},${tile.row} (${tile.x},${tile.y})`);
      }      
      state.circle.x = worldX;
      state.circle.y = worldY;

      redraw();
      return;
    }
    // ---- PINCH PAN + ZOOM ----
    if (pointers.size === 2 || (isPCPanning && pointers.size === 1)) {

      if (isPCPanning && pointers.size === 1) {
        const pos = getCanvasCoords(e);

        const dx = pos.x - lastPanPos.x;
        const dy = pos.y - lastPanPos.y;

        const PAN_SPEED = 1.0;
        state.camera.x += dx * PAN_SPEED;
        state.camera.y += dy * PAN_SPEED;

        lastPanPos = pos;

        state.camera.clampToImage(canvas, state.boardImage);
        redraw();
        return;
      } else {
        const pts = [...pointers.values()];
        const p0 = getCanvasCoords(pts[0]);
        const p1 = getCanvasCoords(pts[1]);

        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;

        const dx = p0.x - p1.x;
        const dy = p0.y - p1.y;
        const dist = Math.hypot(dx, dy);

        if (lastPinchMidpoint) {
          const PAN_SPEED = 1.0;
          state.camera.x += (midX - lastPinchMidpoint.x) * PAN_SPEED;
          state.camera.y += (midY - lastPinchMidpoint.y) * PAN_SPEED;
        }

        if (lastPinchDistance) {
          state.camera.zoomAtPoint(dist / lastPinchDistance, midX, midY);
        }

        lastPinchDistance = dist;
        lastPinchMidpoint = { x: midX, y: midY };
      }

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

  let didSnap = false;

  if (state.circle.dragPointerId === e.pointerId) {
    state.circle.dragging = false;
    state.circle.dragPointerId = null;

    // --- SNAP CIRCLE TO TILE ---
    const cx = state.circle.x;
    const cy = state.circle.y;

    // World → tile
    const tile = state.board.getTileAtWorld(cx, cy);
    if (tile) {
      // Tile → world center
      const center = state.board.tileToWorldCenter(tile);  
      state.circle.x = center.x;
      state.circle.y = center.y;
      if (state.debug.hoveredTile) {
        state.debug.hoveredTile = null;
      }

      didSnap = true;
    }
  }
  if (isPCPanning) {
    isPCPanning = false;
    lastPanPos = null;
  }
  if (pointers.size < 2) {
    lastPinchDistance = null;
    lastPinchMidpoint = null;

    state.camera.clampToImage(canvas, state.boardImage);

    if (didSnap) redraw();
    else redraw();
  }
}

}
