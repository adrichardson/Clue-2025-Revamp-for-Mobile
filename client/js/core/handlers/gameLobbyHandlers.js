import { on } from "../handlers/colyseusCallbacks.js";
import { newchatmessage, newservermessage } from "../utils/chat.js";
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
  on(EVENTS.GAME_LOBBY.PLAYER_JOINED, handlePlayerJoined);
  on(EVENTS.GAME_LOBBY.PLAYER_LEFT, handlePlayerLeft);
  on(EVENTS.GAME_LOBBY.OWNER_CHANGE, handleOwnerChange);
  on(EVENTS.GAME_LOBBY.READYSTATE_CHANGE, handlePlayerReadyChange);
  on(EVENTS.GAME_LOBBY.CHARACTER_CHANGE, handlePlayerCharacterChange);
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

async function handlePlayerJoined(player, gamelobby) {
    if (gamelobby.metadata) {
        setLobbyTitle(gamelobby.metadata);
    }
    newservermessage(EVENTS.GAME_LOBBY.PLAYER_JOINED, player);
}

async function handlePlayerLeft(player, user, gamelobby) {
    if (user.username == player.username) return;

    clearUserCharacter(player.username);

    if (gamelobby.metadata) {
        setLobbyTitle(gamelobby.metadata);
    }
    newservermessage(EVENTS.GAME_LOBBY.PLAYER_LEFT, player);
}

async function handlePlayerCharacterChange(character_id, previousCharacterId, player) {
    if (previousCharacterId === undefined) {
        updateLobbyCharacters(player, character_id);
        return;            
    }
    newservermessage(EVENTS.GAME_LOBBY.CHARACTER_CHANGE, player);
    updateLobbyCharacters(player, character_id);    
}

async function handlePlayerReadyChange(readyState, previousReadyState, player) {
    if (previousReadyState === undefined) return;
    newservermessage(EVENTS.GAME_LOBBY.READYSTATE_CHANGE, player);    
}

async function handlePlayersReadyChange(readyState, previousReadyState) {
    if (previousReadyState === undefined) return;

    checkGameStartConditions(readyState);    
}

async function handleMetaDataChange(metadata, gamelobby) {
    console.log("Metadata changed:", metadata);
    gamelobby.metadata = metadata;
    setLobbyTitle(gamelobby.metadata);
}

async function handleGameStarted(colyseus, game_id) {
    colyseus.disconnect();
    window.location.href = `/game?id=${game_id.game_id}`;    
}

async function handleChatMessage(chatmessage) {
    var { message, player } = chatmessage;
    newchatmessage(message, player);
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
