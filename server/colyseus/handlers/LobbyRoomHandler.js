import { matchMaker } from "colyseus";

export const LobbyRoomHandlers = {
    gamelobbycreated: async (room, client, message) => {
        const games = await matchMaker.query({ name: "gamelobby" });        
        room.broadcast("gamelobbycreated", games, { except: client });
    },
    listgames: async (room, client) => {
        try {
            const games = await matchMaker.query({ name: "gamelobby" });
            client.send("listgames", games);
        } catch (err) {
            console.error("Failed to fetch game list:", err);
        }
    }
};