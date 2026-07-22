import { on } from "../handlers/colyseusCallbacks.js";
import { getUser } from "../utils/user.js";
import { state } from "../gameState.js";
import { updatePermissions, syncState } from "../gameBoard.js";
import MessageManager from "../utils/MessageManager.js";
import MessageFormatter from "../utils/MessageFormatter.js";
import { getCharacterHexColorById } from "../utils/imagehelper.js";
import { showAction } from "../ui/actionManager.js";
import { EVENTS, PHASES, ACTION_TYPES, CARD_TYPES, FEED_TYPES } from "../../../../shared/data/index.js";

export function initGameHandlers() {
  on(EVENTS.SERVER.STATE_READY, handleStateReady);
  on(EVENTS.SERVER.PHASE_CHANGED, handlePhaseChanged);
  on(EVENTS.SERVER.TURN_CHANGED, handleTurnChanged);
  on(EVENTS.SERVER.ROLL_RESULT, handleRoll);
  on(EVENTS.SERVER.CHAT_MESSAGE, handleChatMessage);
  on(EVENTS.SERVER.PLAYER_INVALID_MOVE, handlePlayerInvalidMove);
  on(EVENTS.SERVER.PLAYER_VALID_MOVE, handlePlayerValidMove);
  on(EVENTS.SERVER.OBJECTION_FOUND, handleObjectionFound);
  on(EVENTS.SERVER.OBJECTION_SHOWN, handleObjectionShown);  
  on(EVENTS.SERVER.PLAYER_SHEET, handlePlayerSheet);
  on(EVENTS.SERVER.GAME_PLAYER_LIST, handleGamePlayerList);
  on(EVENTS.SERVER.GAME_LOG, handleGameLog);  
}

async function handleGameLog(log) {
    try {
        const formatted = await MessageFormatter.formatGameLog(log);
        if (!formatted) {
            console.warn("Unhandled game log type", log?.type);
            MessageManager.add({
                type: FEED_TYPES.GAME_LOG,
                message: `Game event: ${log?.type ?? "unknown"}`,
                styles: { fontStyle: "italic", color: "#555555" }
            });
            return;
        }
        MessageManager.add(formatted);
    } catch (err) {
        console.error("Failed to render game log", err, log);
        MessageManager.add({
            type: FEED_TYPES.GAME_LOG,
            message: `Game log error: ${log?.type ?? "unknown"}`,
            styles: { fontStyle: "italic", color: "#ff0000" }
        });
    }
}

async function handleObjectionShown(data) {
    var userid = state.ui.myPlayerId;
    var msgheader = userid == data.player.user_id ? `You have ` : `${data.player.username} has `;
    const message = msgheader + `objected and revealed a card to ${data.currplayer.username}`
    data = {...data, message};
    showAction(ACTION_TYPES.OBJECTION_SHOWN, data); 
}

async function handleObjectionFound(data) {
    const message = `${data.player.username} has objected with ${data.card.type == CARD_TYPES.ROOM || data.card.type == CARD_TYPES.WEAPON ? `the <br> ${data.card.name}` : `<br> ${data.card.name}`}`;
    data = {...data, message};
    showAction(ACTION_TYPES.OBJECTION_FOUND, data); 
}

async function handlePlayerInvalidMove(data) {
    const { player, attemptedMove } = data;

    if (state.playerPiece.room != null) {
        state.playerPiece.snapToRoom(state.playerPiece.room, state.board.origin);
    } else if (state.playerPiece.tile != null) {
        state.playerPiece.snapToTile(state.board.origin);
    }
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

async function handlePlayerSheet(data) {
    const marks = Array.isArray(data?.marks) ? data.marks : [];
    state.sheet = { marks };

    const boxes = document.querySelectorAll(".sheetBox");
    const colorMap = {
        black: "var(--black)",
        blue: "var(--sheet-blue)",
        yellow: "var(--sheet-yellow)",
        red: "var(--sheet-red)",
        green: "var(--sheet-green)",
        purple: "var(--sheet-purple)"
    };

    boxes.forEach((box, index) => {
        const mark = marks[index] || { symbol: "", color: "black" };
        box.textContent = mark.symbol || "";
        box.style.color = mark.symbol ? (colorMap[mark.color] || "var(--sheet-black)") : "var(--sheet-black)";
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
}

async function handleRoll(data) {
    var { player, roll, validMoves } = data;
    var userid = state.ui.myPlayerId;
    var message = `${player.user_id == userid ? 'You' : player.username} rolled a ${roll}!`;

    state.currentTurn.validMoves = validMoves;

    //newservermessage(EVENTS.SERVER.ROLL_RESULT, player, {roll : roll});
    showAction(ACTION_TYPES.ROLL_RESULT, { player, roll });
}

async function handleChatMessage({ message, player }) {
    MessageManager.add(await MessageFormatter.formatChatMessage(message, player));
}

async function handleStateReady(serverstate) {
  state.user = await getUser();
  state.ui.myPlayerId = state.user.user_id;  
  syncState(serverstate);
  setupSpectatorMode(state.user);
}

async function setupSpectatorMode(user) {
    //TODO
    const player = state.players.get(user.user_id);
    if (player && player.isSpectator) {
        document.getElementById("gamesheetbtn").classList.add("disabled");
        document.getElementById("gamehandbtn").classList.add("disabled");
    }
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