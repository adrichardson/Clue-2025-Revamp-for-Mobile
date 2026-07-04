import { on } from "../handlers/colyseusCallbacks.js";
import { newchatmessage, newservermessage } from "../utils/chat.js";
import { listGames } from "../home.js";
import { EVENTS } from "../../../../shared/data/index.js";

export function initMainLobbyHandlers() {
  on(EVENTS.MAINLOBBY.GAMELOBBY_CREATED, handleGameLobbyCreated);
  on(EVENTS.MAINLOBBY.LIST_GAMES, handleListGames);
  on(EVENTS.MAINLOBBY.PLAYER_JOINED, handlePlayerJoined);
  on(EVENTS.MAINLOBBY.PLAYER_LEFT, handlePlayerLeft);  
  on(EVENTS.MAINLOBBY.WELCOME_MESSAGE, handleWelcomeMessage);
  on(EVENTS.SERVER.CHAT_MESSAGE, handleChatMessage);
  on(EVENTS.MAINLOBBY.REFRESH_GAMES, handleRefreshGames);
  on(EVENTS.MAINLOBBY.LOGOUT, handleLogout);  
}

async function handleChatMessage(chatmessage) {
    var { message, username } = chatmessage;
    newchatmessage(message, username);
}

async function handleGameLobbyCreated(message) {
    listGames(message);
}

async function handleListGames(message) {
    listGames(message);
}

async function handleRefreshGames(message, colyseus) {
    colyseus.send(EVENTS.MAINLOBBY.LIST_GAMES);
}

async function handlePlayerJoined(player) {
    console.log("userJoined message:", player);
}

async function handlePlayerLeft(player) {
    console.log("userLeft message:", player);
}

async function handleWelcomeMessage(message) {
    console.log("welcome message:", message);
}

async function handleLogout(message) {
    console.log("userLogout message:", message);
}   