import { initRenderer, redraw } from "../canvas/utils/renderer.js";
import { setupInput } from "../canvas/utils/input.js";
import { state } from "./gameState.js";
import { Piece } from "./board/Piece.js";

export const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* =========================
   CANVAS SETUP
========================= */

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (state.imageLoaded) {
    state.camera.fitImageToCanvas(canvas, state.boardImage);
  }
}


window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* =========================
   RENDERER INIT
========================= */

initRenderer(ctx, canvas.width, canvas.height);

/* =========================
   IMAGE LOAD → CAMERA SETUP
========================= */

state.boardImage.onload = () => {
  state.imageLoaded = true;

  // 🔑 Fit board to screen (height-based like before)
  state.camera.fitImageToCanvas(canvas, state.boardImage);
};

function initPieces() {
  /*
  --profplum: #8F5770;
  --colmustard: #8C5723;
  --msscarlet: #DF4531;
  --mrgreen: #599B53;
  --mrswhite: #808080;
  --mrspeacock: #6CA5B9; 
  tile, owner, id, radius = 20, color 
  */
  const pieceData = [
    { tile: state.board.getTile(16, 0), owner: "player1", id: "msscarlet", color: "#DF4531"},
    { tile: state.board.getTile(9, 24), owner: "player2", id: "mrgreen", color: "#599B53" },
    { tile: state.board.getTile(14, 24), owner: "player3", id: "mrswhite", color: "#808080" },
    { tile: state.board.getTile(0, 5), owner: "player4", id: "profplum", color: "#8F5770" },
    { tile: state.board.getTile(23, 7), owner: "player5", id: "colmustard", color: "#8C5723"},
    { tile: state.board.getTile(0, 18), owner: "player6", id: "mrspeacock", color: "#6CA5B9"}
  ];

  for (const data of pieceData) {
    const piece = new Piece({ tile: data.tile, owner: data.owner, id: data.id, radius: 20, color: data.color });
    piece.snapToTile(state.board.origin);
    state.pieces.set(data.id, piece);
  }

}

initPieces();

/* =========================
   INPUT
========================= */

setupInput(canvas, state, redraw);

/* =========================
   RENDER LOOP
========================= */

function loop() {
  redraw();
  requestAnimationFrame(loop);
}

loop();
