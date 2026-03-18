import { initRenderer, redraw } from "../core/utils/renderer.js";
import { setupInput } from "../core/utils/input.js";
import { state } from "./gameState.js";
import { Piece } from "../core/board/Piece.js";
import { AnimationHandler } from "../core/utils/animationHandler.js";
import { SpriteAnimation } from "../core/utils/SpriteAnimation.js";

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
  --colmustard: #F7BF00;
  --msscarlet: #DF4531;
  --mrgreen: #599B53;
  --mrswhite: #EEF6E8;
  --mrspeacock: #6CA5B9; 
  tile, owner, id, radius = 20, color 
  */
  const pieceData = [
    { tile: state.board.getTile(16, 0), owner: "player1", id: "msscarlet", color: "#DF4531"},
    { tile: state.board.getTile(9, 24), owner: "player2", id: "mrgreen", color: "#599B53" },
    { tile: state.board.getTile(14, 24), owner: "player3", id: "mrswhite", color: "#EEF6E8" },
    { tile: state.board.getTile(0, 5), owner: "player4", id: "profplum", color: "#8F5770" },
    { tile: state.board.getTile(23, 7), owner: "player5", id: "colmustard", color: "#F7BF00"},
    { tile: state.board.getTile(0, 18), owner: "player6", id: "mrspeacock", color: "#6CA5B9"}
  ];

  for (const data of pieceData) {
    const piece = new Piece({ tile: data.tile, owner: data.owner, id: data.id, radius: 20, color: data.color });
    piece.snapToTile(state.board.origin);
    state.pieces.set(data.id, piece);
  }

}

initPieces();

const animationHandler = new AnimationHandler();

const diceImage = new Image();
diceImage.src = "../../../assets/sprites/dice.png"; // your sprite sheet
diceImage.onload = () => {
  console.log(
    "Dice loaded:",
    diceImage.width,
    diceImage.height
  );  
  rollDiceAt(canvas.width / 2, canvas.height / 2);
};

function rollDiceAt(x, y) {
  const result = Math.floor(Math.random() * 6) + 1; // 1–6

  const anim = new SpriteAnimation({
    image: diceImage,
    frameWidth: diceImage.width / 6,
    frameHeight: diceImage.height,
    interactive: true,
    frameCount: 6,
    position: { x, y },
    scale: 3.0,
    duration: 1200,            // 🔑 slower roll
    finalFrame: result - 1,    // 0-based index
    onFinish: () => {
      console.log("Dice result:", result);
    }
  });

  animationHandler.add(anim);
}

/* =========================
   INPUT
========================= */

setupInput(canvas, state, handlePointerDown);

function handlePointerDown({ canvasX, canvasY, worldX, worldY }) {
  // 🎲 UI animations use canvas coords
  if (animationHandler.handleClick(canvasX, canvasY)) {
    return true;
  }

  // Board logic uses world coords
  return false;
}

/* =========================
   RENDER LOOP
========================= */

// function loop() {
//   redraw();
//   requestAnimationFrame(loop);
// }

let lastTime = performance.now();

function loop(now) {
  const dt = now - lastTime;
  lastTime = now;

  redraw();                    // draw board, tiles, pieces
  animationHandler.update(dt); // update animations
  animationHandler.draw(ctx);  // draw animations on top

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

loop();
