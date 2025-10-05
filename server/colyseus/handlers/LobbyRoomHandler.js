import { matchMaker } from "colyseus";

export const lobbyroomHandlers = {
    gamecreated: (room, client, message) => {
        room.broadcast("gamecreated", { games : room.state.activegames }, { except: client });
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