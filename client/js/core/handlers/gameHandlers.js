import { on } from "../handlers/colyseusCallbacks.js";
import { getUser } from "../utils/user.js";
import { state } from "../gameState.js";
import { updatePermissions, syncState } from "../gameBoard.js";
import { newchatmessage, newservermessage } from "../utils/chat.js";
import { showAction } from "../ui/actionManager.js";
import { EVENTS, PHASES, ACTION_TYPES, CARD_TYPES } from "../../../../shared/data/index.js";

export function initGameHandlers() {
  on(EVENTS.SERVER.STATE_READY, handleStateReady);
  on(EVENTS.SERVER.PHASE_CHANGED, handlePhaseChanged);
  on(EVENTS.SERVER.TURN_CHANGED, handleTurnChanged);
  on(EVENTS.SERVER.ROLL_RESULT, handleRoll);
  on(EVENTS.SERVER.CHAT_MESSAGE, handleChatMessage);
  on(EVENTS.SERVER.PLAYER_ADDED, handlePlayerAdded);
  on(EVENTS.SERVER.PLAYER_REMOVED, handlePlayerRemoved);
  on(EVENTS.SERVER.PLAYER_INVALID_MOVE, handlePlayerInvalidMove);
  on(EVENTS.SERVER.PLAYER_VALID_MOVE, handlePlayerValidMove);
  on(EVENTS.SERVER.OBJECTION_FOUND, handleObjectionFound);
  on(EVENTS.SERVER.GAME_PLAYER_LIST, handleGamePlayerList);  
}

async function handleObjectionFound(data) {
    const message = `${data.player.username} has objected with ${data.card.type == CARD_TYPES.ROOM || data.card.type == CARD_TYPES.WEAPON ? `the <br> ${data.card.name}` : `<br> ${data.card.name}`}`;
    data = {...data, message};
    showAction(ACTION_TYPES.OBJECTION_FOUND, data); 
}

async function handlePlayerAdded(state, player) {
    console.log("player added:", player.username);    
    newservermessage(EVENTS.SERVER.PLAYER_ADDED, player);
}

async function handlePlayerRemoved(state, player) {
    console.log("player removed:", player.username);    
    newservermessage(EVENTS.SERVER.PLAYER_REMOVED, player);
}

async function handlePlayerInvalidMove(data) {
    const { player, attemptedMove } = data;
    if (attemptedMove.type === "tile") {
        console.log(`Player ${player.username} attempted an invalid move to tile ${attemptedMove.id}.`);    
    } else if (attemptedMove.type === "room") {
        console.log(`Player ${player.username} attempted an invalid move to room ${attemptedMove.id}.`);  
    }

    if (state.playerPiece.room != null) {
        state.playerPiece.snapToRoom(state.playerPiece.room, state.board.origin);
    } else if (state.playerPiece.tile != null) {
        state.playerPiece.snapToTile(state.board.origin);
    }
    //newservermessage(EVENTS.SERVER.PLAYER_INVALID_MOVE, player, { message });
}

async function handleGamePlayerList(data) {
    const currentUser = await getUser();
    const orderedUsers = Array.isArray(data?.users) ? data.users : [];
    const users = orderedUsers.filter(username => username !== currentUser?.username);
    const headers = document.querySelectorAll("#gamesheetModal .sheetColumnHeader span");

    headers.forEach((header, index) => {
        const sectionIndex = Math.floor(index / 5);
        const username = users[index - sectionIndex * 5] || "";
        header.textContent = username;
        header.title = username;
    });
}

async function handlePlayerValidMove(data) {
    const { player, validMove } = data;
    let message = `Player ${player.username} made a valid move.`;

    if(validMove.type === "room") {
        var room = state.board.rooms.get(validMove.id);
        state.playerPiece.room = room;
        state.playerPiece.snapToRoom(room, state.board.origin);
        message += ` Entered the ${validMove.id}.`;

    } else if (validMove.type === "tile") {
        state.playerPiece.tile = state.board.tiles.get(validMove.id);
        state.playerPiece.snapToTile(state.board.origin);
        message += ` Moved to tile ${validMove.id}.`;

    }
    console.log(message);
}

async function handleRoll(data) {
    var { player, roll, validMoves } = data;
    var userid = state.ui.myPlayerId;
    var message = `${player.user_id == userid ? 'You' : player.username} rolled a ${roll}!`;

    state.currentTurn.validMoves = validMoves;

    newservermessage(EVENTS.SERVER.ROLL_RESULT, player, {roll : roll});
    showAction(ACTION_TYPES.ROLL_RESULT, { player, roll });
}

async function handleChatMessage(chatmessage) { 
    var { message, player } = chatmessage;
    newchatmessage(message, player);
}

async function handleStateReady(serverstate) {
  console.log("initialstate syncing");
  state.user = await getUser();
  state.ui.myPlayerId = state.user.user_id;    
  syncState(serverstate);
  console.log("initialstate synced");
}

async function handlePhaseChanged(phase, previousPhase, serverstate) {
  if (previousPhase === undefined) return;    
  console.log(`CALLBACK PHASE: ${phase}`);
  syncState(serverstate);
}

async function handleTurnChanged(turn, previousTurn, serverstate) {
  if (previousTurn === undefined) return;    
  console.log(`CALLBACK TURN: ${turn}`);
  //state.ui.currentTurn= turn;
  syncState(serverstate);
}