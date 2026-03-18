import { Camera } from "./utils/camera.js";
import { Board } from "./board/Board.js";

export const state = {
  boardImage: new Image(),
  imageLoaded: false,
  camera: new Camera(),
  board: new Board(),
  pieces: new Map(),
  playerPiece: 'msscarlet',
  debug: {
    showTiles: false,
    showRooms: false,
    hoveredTile: null,
    hoveredRoom: null
  }
};

state.boardImage.src = "../../assets/imgs/board/ClueBoard.jpg";
