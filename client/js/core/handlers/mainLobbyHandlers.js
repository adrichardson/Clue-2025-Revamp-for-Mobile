import { on } from "../handlers/colyseusCallbacks.js";
import MessageManager from "../utils/MessageManager.js"
import MessageFormatter from "../utils/MessageFormatter.js";
import { listGames, listOnlineUsers } from "../home.js";
import { EVENTS } from "../../../../shared/data/index.js";

export function initMainLobbyHandlers() {
  on(EVENTS.MAINLOBBY.GAMELOBBY_CREATED, handleGameLobbyCreated);
  on(EVENTS.MAINLOBBY.LIST_GAMES, handleListGames);
  on(EVENTS.MAINLOBBY.ONLINE_USERS, handleOnlineUsers);
  on(EVENTS.SERVER.CHAT_MESSAGE, handleChatMessage);
  on(EVENTS.MAINLOBBY.REFRESH_GAMES, handleRefreshGames);
  on(EVENTS.MAINLOBBY.LOGOUT, handleLogout);
}

async function handleOnlineUsers(data) {
  const { usernames } = data;
  listOnlineUsers(usernames);
}

async function handleChatMessage(chatmessage) {
    var { message, username } = chatmessage;
    const formatted = await MessageFormatter.formatChatMessage(message, username);
    MessageManager.add(formatted); 
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

async function handleLogout(message) {
    console.log("userLogout message:", message);
}   