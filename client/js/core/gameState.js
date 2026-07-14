import { Camera } from "./utils/camera.js";
import { Board } from "./board/Board.js";
import { Piece } from "./board/Piece.js";

export const state = {
  boardImage: new Image(),
  imageLoaded: false,

  camera: new Camera(),
  board: new Board(),

  pieces: new Map(),
  user: null,
  playerPiece: null,
  players: new Map(),
  characters: new Map(),
  turn: 1,
  phase: "",
  currentTurn: null,
  playerwinner: false,

  ui: {
    myPlayerId: null,
    isMyTurn: false,
    canRoll: false,
    canMove: false,
    canSuggest: false,
  },

  debug: {
    showTiles: false,
    showRooms: false,
    hoveredTile: null,
    hoveredRoom: null
  }
};