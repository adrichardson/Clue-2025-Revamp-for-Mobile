import { matchMaker } from "colyseus";
import { EVENTS } from "../../../shared/data/index.js";

export const LobbyRoomHandlers = {
    [EVENTS.MAINLOBBY.GAMELOBBY_CREATED]: async (room, client, message) => {
        const lobbies = await matchMaker.query({ name: "gamelobby" });
        room.broadcast(EVENTS.MAINLOBBY.GAMELOBBY_CREATED, lobbies, { except: client });
    },
    [EVENTS.MAINLOBBY.LIST_GAMES]: async (room, client) => {
        try {
            const lobbies = await matchMaker.query({ name: "gamelobby" });
            client.send(EVENTS.MAINLOBBY.LIST_GAMES, lobbies);
        } catch (err) {
            console.error("Failed to fetch game list:", err);
        }
    }
};