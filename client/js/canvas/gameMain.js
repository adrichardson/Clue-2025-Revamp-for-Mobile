import { setupCanvas } from "./canvasEngine.js";
import { setupInput } from "./utils/input.js";
import { Camera } from "./utils/camera.js";
import { Board } from "./board/Board.js";

export const canvas = document.getElementById("gameCanvas");

// ---- GAME STATE ----
export const state = {
  boardImage: new Image(),
  imageLoaded: false,

  camera: new Camera(),
  board: new Board(),

  circle: {
    x: 0,
    y: 0,
    radius: 20,
    dragging: false,
    dragPointerId: null
  },
  debug: {
    showTiles: false,
    showRooms: false,
    hoveredTile: null,
    hoveredRoom: null
  }
};

// ---- LOAD BOARD IMAGE ----
state.boardImage.src = "../../assets/imgs/board/ClueBoard.jpg";
state.boardImage.onload = () => {
  state.imageLoaded = true;

  const heightScale = canvas.height / state.boardImage.height;
  state.camera.scale = heightScale;
  state.camera.minScale = heightScale;
  state.camera.maxScale = heightScale * 3;

  state.camera.x = 0; // left-aligned (as you wanted)
  state.camera.y = 0;

  const pos = state.board.getTileCenterWorld(0, 0);
  state.circle.x = pos.x;
  state.circle.y = pos.y;

  redraw();
};

// ---- DRAWING ----
let ctx, canvasWidth, canvasHeight;

function draw(ctx, w, h) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.translate(state.camera.x, state.camera.y);
  ctx.scale(state.camera.scale, state.camera.scale);

  if (state.imageLoaded) {
    ctx.drawImage(state.boardImage, 0, 0);
  }

  drawCircle(ctx);
  if (state.debug.showTiles) {
    drawTileDebug(ctx, state.board);
  }
  if (state.debug.showRooms) {
    drawRoomDebug(ctx, state.board);
  }
  if (state.debug.hoveredTile) {
    const tile = state.debug.hoveredTile;
    ctx.fillStyle = "rgba(0,255,0,0.3)";
    ctx.fillRect(
      state.board.origin.x + tile.x,
      state.board.origin.y + tile.y,
      tile.w,
      tile.h
    );
  }  
  ctx.restore();
}

function drawCircle(ctx) {
  const c = state.circle;
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(109, 3, 3, 1)";
  ctx.fill();
}

function drawTileDebug(ctx, board) {
  ctx.lineWidth = 1 / state.camera.scale + 1;
  ctx.strokeStyle = "rgba(0, 4, 255, 0.6)";

  for (const tile of board.tiles.values()) {
    ctx.strokeRect(
      board.origin.x + tile.x,
      board.origin.y + tile.y,
      tile.w,
      tile.h
    );
  }
}

function drawRoomDebug(ctx, board) {
  ctx.lineWidth = 2 / state.camera.scale + 1;

  for (const room of board.rooms.values()) {
    ctx.strokeStyle = "rgba(255, 0, 13, 0.76)";

    for (const tile of room.tiles) {
      ctx.strokeRect(
        board.origin.x + tile.x,
        board.origin.y + tile.y,
        tile.w,
        tile.h
      );
    }
  }
}

export function redraw() {
  if (ctx) draw(ctx, canvasWidth, canvasHeight);
}

// ---- INIT ----
setupCanvas(canvas, (context, w, h) => {
  ctx = context;
  canvasWidth = w;
  canvasHeight = h;

  redraw();
});

// ✅ input isolated
setupInput(canvas, state, redraw);
