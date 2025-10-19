import { matchMaker } from "colyseus";

export const LobbyRoomHandlers = {
    gamelobbycreated: async (room, client, message) => {
        const lobbies = await matchMaker.query({ name: "gamelobby" });
        room.broadcast("gamelobbycreated", lobbies, { except: client });
    },
    listgames: async (room, client) => {
        try {
            const lobbies = await matchMaker.query({ name: "gamelobby" });
            client.send("listgames", lobbies);
        } catch (err) {
            console.error("Failed to fetch game list:", err);
        }
    }
};