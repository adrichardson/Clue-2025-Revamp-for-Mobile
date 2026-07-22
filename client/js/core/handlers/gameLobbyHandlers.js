import { on } from "../handlers/colyseusCallbacks.js";
import MessageManager from "../utils/MessageManager.js";
import MessageFormatter from "../utils/MessageFormatter.js";
import UIManager from "../utils/UIManager.js";
import { getCharacterHexColorById } from "../utils/imagehelper.js";
import { getUser } from "../utils/user.js";
import { setLobbyTitle, updateLobbyCharacters, clearUserCharacter, checkGameStartConditions, startLobbyCountdown, cancelLobbyCountdown } from "../gameLobby.js";
import { EVENTS, SCHEMA_FIELDS } from "../../../../shared/data/index.js";

export function initGameLobbyHandlers() {
  on(EVENTS.SERVER.CHAT_MESSAGE, handleChatMessage);     
  on(EVENTS.GAME_LOBBY.PLAYERS_READY, handlePlayersReadyChange);
  on(EVENTS.GAME_LOBBY.METADATA_CHANGE, handleMetaDataChange);
  on(EVENTS.GAME_LOBBY.DISCONNECT, handleDisconnect);
  on(EVENTS.GAME_LOBBY.GAME_STARTED, handleGameStarted);
  on(EVENTS.GAME_LOBBY.GAME_STARTING, handleGameStarting);
  on(EVENTS.GAME_LOBBY.GAME_START_CANCELLED, handleGameStartCancelled);
  on(EVENTS.GAME_LOBBY.PLAYER_LEFT, handlePlayerLeft);
  on(EVENTS.GAME_LOBBY.OWNER_CHANGE, handleOwnerChange);
  on(EVENTS.GAME_LOBBY.READYSTATE_CHANGE, handlePlayerReadyChange);
  on(EVENTS.GAME_LOBBY.CHARACTER_CHANGE, handlePlayerCharacterChange);
  on(EVENTS.SERVER.GAME_LOG, handleGameLog);
}

async function handleGameLog(log) {
    const formatted = await MessageFormatter.formatGameLog(log);
    MessageManager.add(formatted);
}

async function handleGameStarting(data) {
    startLobbyCountdown(data?.seconds ?? 5);
}

async function handleGameStartCancelled() {
    cancelLobbyCountdown();
}

async function handleOwnerChange(data, gamelobby) {
    gamelobby.metadata.owner = data.username;
}

// async function handlePlayerJoined(player, gamelobby) {
//     if (gamelobby.metadata) {
//         setLobbyTitle(gamelobby.metadata);
//     }
// }

async function handlePlayerLeft(player, user, gamelobby) {
    if (user.username == player.username) return;

    clearUserCharacter(player.username);

    if (gamelobby.metadata) {
        setLobbyTitle(gamelobby.metadata);
    }
}

async function handlePlayerCharacterChange(character_id, previousCharacterId, player) {
    // if (previousCharacterId === undefined) {
    //     updateLobbyCharacters(player, character_id);
    //     return;            
    // }
    updateLobbyCharacters(player, character_id);    
}

async function handlePlayerReadyChange(readyState, previousReadyState, player) {
    if (previousReadyState === undefined) return;
    UIManager.updatePlayerReady(player);
}

async function handlePlayersReadyChange(readyState, previousReadyState) {
    if (previousReadyState === undefined) return;
    checkGameStartConditions(readyState);    
}

async function handleMetaDataChange(metadata, gamelobby) {
    gamelobby.metadata = metadata;
    setLobbyTitle(gamelobby.metadata);
}

async function handleGameStarted(colyseus, game_id) {
    colyseus.disconnect();
    window.location.href = `/game?id=${game_id.game_id}`;    
}

async function handleChatMessage({ message, player }) {
    MessageManager.add(await MessageFormatter.formatChatMessage(message, player));
}

async function handleDisconnect() {
    window.history.back();
}

export function getActivePlayerCount(players) {
    let count = 0;

    for (const player of players.values()) {
        if (!player.isSpectator) {
            count++;
        }
    }
    return count;
}
