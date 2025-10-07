import { matchMaker } from "colyseus";

export const lobbyroomHandlers = {
    gamecreated: async (room, client, message) => {
        const games = await matchMaker.query({ name: "game" });        
        room.broadcast("gamecreated", games, { except: client });
    },
    listgames: async (room, client) => {
        try {
            const games = await matchMaker.query({ name: "game" });
            client.send("listgames", games);
        } catch (err) {
            console.error("Failed to fetch game list:", err);
        }
    }
};