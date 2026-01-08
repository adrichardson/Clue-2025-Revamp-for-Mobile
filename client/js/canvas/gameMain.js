import { setupCanvas } from "./canvasEngine.js";
import { setupInput } from "./input.js";
import { TILE_SIZE } from "./board/boardData-old.js";
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

  state.circle.x = state.boardImage.width * 0.2;   // left-ish
  state.circle.y = state.boardImage.height * 0.5;  // vertical center

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
  drawDebug(ctx, state);  
  ctx.restore();
}

function drawCircle(ctx) {
  const c = state.circle;
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,0,0,0.7)";
  ctx.fill();
}

function drawDebug(ctx, state) {
  const dbg = state.debug;
  if (!dbg?.hoveredTile) return;
  const tile = dbg.hoveredTile;

  const x =
    tile.col * TILE_SIZE.w ;
  const y =
    tile.row * TILE_SIZE.h;

  ctx.save();

  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    x,
    y,
    TILE_SIZE.w ,
    TILE_SIZE.h
  );

  if (dbg.hoveredRoom) {
    ctx.fillStyle = "rgba(0,255,0,0.15)";
    ctx.fillRect(
      x,
      y,
      TILE_SIZE.w ,
      TILE_SIZE.h
    );
  }

  ctx.restore();
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
