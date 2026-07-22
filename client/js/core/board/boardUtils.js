// board/boardUtils.js
import { ROOMS, TILE_SIZE, BOARD_COLS, BOARD_ROWS, BOARD_ORIGIN_PX, TOASTS, TOAST_DURATIONS } from "../../../shared/data/index.js";
import { showToast } from "../utils/utils.js";

export function worldToGrid(worldX, worldY) {
  // Convert world coords to image pixel coords
  const imgX = worldX;
  const imgY = worldY;

  const localX = imgX - BOARD_ORIGIN_PX.x;
  const localY = imgY - BOARD_ORIGIN_PX.y;

  if (localX < 0 || localY < 0) return null;

  const col = Math.floor(localX / TILE_SIZE.w);
  const row = Math.floor(localY / TILE_SIZE.h);

  if (
    col < 0 || col >= BOARD_COLS ||
    row < 0 || row >= BOARD_ROWS
  ) return null;

  return { col, row };
}

export function detectBoardLocation(state, worldX, worldY) {
    const cell = worldToGrid(worldX, worldY);
    if (!cell) return;
    const room = getRoomAt(cell.col, cell.row);

    if (room) {
        showToast(`ROOM: ${room.name}`, TOASTS.INFO, TOAST_DURATIONS.HOVER);
        state.debug.hoveredRoom = room;      
    } else {
        showToast(`HALLWAY (${cell.col}, ${cell.row})`, TOASTS.INFO, TOAST_DURATIONS.HOVER);
        state.debug.hoveredTile = cell;    
    }
}

export function getRoomAt(col, row) {
  for (const room of ROOMS) {
    const insideRect =
      col >= room.x &&
      col < room.x + room.w &&
      row >= room.y &&
      row < room.y + room.h;

    if (!insideRect) continue;

    // Check exclusions (doors, paths, gaps)
    if (room.exclude?.has(`${col},${row}`)) return null;

    return room;
  }
  return null;
}