import { detectBoardLocation } from "./board/boardUtils.js";

export function setupInput(canvas, state, redraw) {
  const pointers = new Map();
  let lastPinchDistance = null;
  let lastPinchMidpoint = null;

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
    pointers.set(e.pointerId, e);

    if (pointers.size !== 1) return;

    const { worldX, worldY } = getWorldCoords(e);

    // ---- TILE / ROOM DEBUG ----
    detectBoardLocation(state, worldX, worldY);

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

  canvas.addEventListener("pointermove", e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, e);

    // ---- DRAG CIRCLE ----
    if (
    state.circle.dragging &&
    state.circle.dragPointerId === e.pointerId &&
    pointers.size === 1
    ) {
    const { worldX, worldY } = getWorldCoords(e);
    state.circle.x = worldX;
    state.circle.y = worldY;

    // 🔥 NEW: detect square/room under token
    detectBoardLocation(state, worldX, worldY);

    redraw();
    return;
    }

    // ---- PINCH PAN + ZOOM ----
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
        const PAN_SPEED = 1.0;
        state.camera.x += (midX - lastPinchMidpoint.x) * PAN_SPEED;
        state.camera.y += (midY - lastPinchMidpoint.y) * PAN_SPEED;
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

    if (state.circle.dragPointerId === e.pointerId) {
      state.circle.dragging = false;
      state.circle.dragPointerId = null;
    }

    if (pointers.size < 2) {
      lastPinchDistance = null;
      lastPinchMidpoint = null;
      state.camera.clampToImage(canvas, state.boardImage);
      redraw();
    }
  }

 
}
