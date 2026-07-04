import { initRenderer, redraw } from "./utils/renderer.js";
import { setupInput } from "./utils/input.js";
import { state } from "./gameState.js";
import { Piece } from "./board/Piece.js";
// import { AnimationHandler } from "./utils/animationHandler.js"; //for future animations uncomment all AnimationHandler lines
import { CHARACTERS, PHASES, ACTION_TYPES, EVENTS, ROOM_DEFS, getBlockedTiles } from "../../../shared/data/index.js";
import { initGameHandlers } from "../core/handlers/gameHandlers.js";
import { showAction } from "./ui/actionManager.js";

export const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// const animationHandler = new AnimationHandler();
let lastTime = performance.now();

async function init() {
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  initRenderer(ctx, canvas.width, canvas.height);
  initGameHandlers();
  console.log("initGameHandlers running");
  setupInput(canvas, state, handlePointerDown);  

  await loadBoardImage();
  state.camera.fitImageToCanvas( canvas, state.boardImage);
  state.imageLoaded = true;

  requestAnimationFrame(loop);  
}

async function loadBoardImage() {

  return new Promise((resolve, reject) => {

    const image = new Image();

    image.onload = () => {
      state.boardImage = image;
      resolve();
    };

    image.onerror = reject;
    image.src = "../../assets/imgs/board/ClueBoard.jpg";
  });
}

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

export function syncState(serverstate){
  state.players = serverstate.players;
  state.characters = serverstate.characters;
  state.phase = serverstate.phase;
  state.turn = serverstate.turn;
  const turn = serverstate.currentTurn;  
  state.currentTurn = {
    currentPlayerId: turn.currentPlayerId,
    diceRoll: turn.diceRoll,
    hasMoved: turn.hasMoved,
    hasSuggested: turn.hasSuggested,
    suggestion: turn.suggestion,
    objectingPlayerId: turn.objectingPlayerId,
    validMoves: {
      tiles: [...turn.validMoves.tiles],
      rooms: [...turn.validMoves.rooms],
    }
  };
  syncPiecesFromGameState(serverstate.players, serverstate.characters);
  updatePermissions();  
  updateActionUI();
}

export function mustPassFromRoom(roomId, blockedTiles = new Set()) {
  if (!roomId) return false;

  const room = ROOM_DEFS.find(r => r.id === roomId);
  if (!room) return false;

  return room.doors.every(doorTileId =>
    blockedTiles.has(doorTileId)
  );
}

export function updatePermissions() {
  const ui = state.ui;
  ui.isMyTurn = ui.myPlayerId === state.currentTurn.currentPlayerId;    
  ui.canRoll = ui.isMyTurn && state.phase === PHASES.TURN_START;
  ui.canMove = ui.isMyTurn && state.phase === PHASES.MOVE;
  ui.canSuggest = ui.isMyTurn && ui.phase === PHASES.SUGGESTION;
}

export function updateActionUI() {
  const phase = state.phase;
  const hasMoved = state.currentTurn.hasMoved;
  const isMyTurn = state.ui.isMyTurn;
  const player = state.players.get(state.currentTurn.currentPlayerId);
  const piece = getPieceByUsername(player?.username);
  const character = Array.from(state.characters).find(c => c.character_id == piece?.character_id)
  let message = "";

  switch (phase) {
    case PHASES.TURN_START:
      const canStay = player.calledIn && !hasMoved;
      const canPassage = !hasMoved && (piece.room?.passage != null);
      const blockedTiles = getBlockedTiles(state.characters, character.character_id);
      const mustPass = mustPassFromRoom(piece.room?.id, blockedTiles) && !canStay && !canPassage;      
      message = `It's ${isMyTurn ? "your" : `${player?.username}'s`} turn!`;      
      showAction(ACTION_TYPES.NEW_TURN_START, 
        { message , 
          passage: {canPassage, room: piece.room?.passage}, 
          canStay, 
          pass : {mustPass, cantleaveroom: mustPassFromRoom(piece.room?.id, blockedTiles)},
          isMyTurn });
      break
    case PHASES.MOVE:  
      if (hasMoved === false) {
        message = `${ isMyTurn ? "You" : player?.username} rolled a ${state.currentTurn.diceRoll}`
        showAction(ACTION_TYPES.ROLL_RESULT, {  message });
      }
      break;      
    case PHASES.SUGGESTION:
      message = isMyTurn ? "Make an accusation." : `${player.username} is making an accusation from the ${piece?.room.name}!`;
      showAction(ACTION_TYPES.SUGGESTION, { message, room: piece?.room, isMyTurn, isFinal: false });
      break;
    case PHASES.OBJECTION:
      const objectingplayer = state.players.get(state.currentTurn.objectingPlayerId);
      const suggestion = state.currentTurn.suggestion;
      const objector = (String(state.currentTurn.objectingPlayerId) == String(state.ui.myPlayerId));   
      message = `${ objector ? `Select a card to show ${player.username}` : `${objectingplayer?.username} is objecting to
                  <br> ${suggestion.suspect}<br>${suggestion.weapon}<br>${suggestion.room}` }`;
      objector ? showAction(ACTION_TYPES.OBJECTION, {message, suggestion, objector}) : showAction(ACTION_TYPES.OBJECTION, {message, objector});     
      break;           
    case PHASES.FINAL_POSSIBLE:
      message = isMyTurn ? `Everyone has passed. <br> Make a final accusation?` : `Everyone has passed. <br> ${player.username} is deciding if they will make a final accusation.`;
      showAction(ACTION_TYPES.CHOOSE_FINAL, { player, user: state.user, isMyTurn, message });
      break;
    case PHASES.FINAL_SUGGESTION:
      message = isMyTurn ? `Make a final accusation!` : `${player.username} is making a final accusation!`;      
      showAction(ACTION_TYPES.MAKE_FINAL, { player, user: state.user, isMyTurn, message, isFinal: true });
      break;
    case PHASES.GAME_OVER:
      message = `${ isMyTurn ? "You" : player?.username} solved the murder!`;
      const solution = state.currentTurn.suggestion;      
      showAction(ACTION_TYPES.GAME_OVER, { player, user: state.user, message, solution });
      break;
  }
}

function syncPiecesFromGameState(players, characters) {

    state.pieces.clear();
    for(const room of state.board.rooms) {
      room[1].clearRoom();
    }
    
    const playerByCharacterId = new Map();

    for (const player of players.values()) {
      playerByCharacterId.set(player.character_id, player);
    }    

    for (const character of CHARACTERS) {

      const ownerPlayer = playerByCharacterId.get(character.id);
      const owner = ownerPlayer? ownerPlayer.username : "NPC";
      const characterState = characters.get(String(character.id));

      let tile = null;
      let room = null;

      if (characterState) {
        if (characterState.currentRoomId) {
          room = state.board.rooms.get(characterState.currentRoomId);
        } else if (characterState.currentTileId) {
          tile = state.board.tiles.get(characterState.currentTileId);
        }
      }

      if (!tile && !room) {
        tile = getCharacterStartTile(character.id);
      }

      const piece = new Piece({
        tile,
        room,
        owner,
        id: character.key,
        radius: 20,
        color: character.color
      });

      if (room) {
        piece.snapToRoom(room, state.board.origin);
      } else {
        piece.snapToTile(state.board.origin);
      }

      state.pieces.set(character.key, piece);

      if (owner === state.user?.username) {
        state.playerPiece = piece;
      }           

    } 
}

function getCharacterStartTile(characterId) {
  const character = CHARACTERS.find(c => c.id === characterId);

  if (!character) return null;

  return state.board.getTile(
    character.startTile.x,
    character.startTile.y
  );
}

function getPieceByUsername(username) {
  for(const piece of state.pieces){
    if (piece[1].owner == username) {
      return piece[1];
    }
  }
  return null;
}

function getCharacterColor(characterId) {
  switch(characterId) {
    case 0: return "#DF4531"; // scarlet
    case 1: return "#599B53";
    case 2: return "#EEF6E8";
    case 3: return "#8F5770";
    case 4: return "#F7BF00";
    case 5: return "#6CA5B9";
    default: null;
  }
}

function handlePointerDown({ canvasX, canvasY, worldX, worldY }) {
  // if (animationHandler.handleClick(canvasX, canvasY)) {
  //   return true;
  // }
  // Board logic uses world coords
  return false;
}

function loop(now) {
  const dt = now - lastTime;
  lastTime = now;

  redraw();                    // draw board, tiles, pieces
  // animationHandler.update(dt); // update animations
  // animationHandler.draw(ctx);  // draw animations on top

  requestAnimationFrame(loop);
}

init();