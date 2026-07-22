import { createGame } from "../../services/gameService.js";
import { EVENTS } from "../../../shared/data/index.js";

const cancelPendingGameStart = (room) => {
    if (room.gameStartTimer) {
        clearTimeout(room.gameStartTimer);
        room.gameStartTimer = null;
        room.broadcast(EVENTS.GAME_LOBBY.GAME_START_CANCELLED);
    }
};

export const GameLobbyRoomHandlers = {
    [EVENTS.GAME_LOBBY.READYSTATE_CHANGE]: (room, client, message) => {
        let user = message.user;
        const player = room.state.getPlayer(user.user_id);
        if (player) {
            player.readystate = !player.readystate;        
        }

        room.updatePlayersReady();

        if (room.gameStartTimer && !room.state.playersReady) {
            cancelPendingGameStart(room);
        }
        room.gameLog.readyChanged(player);
    },
    [EVENTS.GAME_LOBBY.CHARACTER_CHANGE]: async (room, client, message) => {
        let user = message.user;        
        const player = room.state.getPlayer(user.user_id);
        if (player) {
            player.character_id = message.character_id;
            player.isSpectator = message.character_id === -1;
        }    
        room.updatePlayersReady();
        await room.updateCurrentPlayersMetadata();
        // room.gameLog.characterChanged(player);
    },
    [EVENTS.CLIENT.CHAT_MESSAGE]: (room, client, message) => {
        let user = message.user;
        let chatmessage = message.message;
        const player = room.state.getPlayer(user.user_id);        
        room.broadcast(EVENTS.SERVER.CHAT_MESSAGE, { message: chatmessage, player : player });
    },
    [EVENTS.GAME_LOBBY.START_GAME_REQUEST]: async (room, client, message) => {
        const user = message.user;

        if (!user || user.username !== room.metadata.owner) return;
        if (!room.state.playersReady) return;
        if (room.gameStartTimer) return;

        room.broadcast(EVENTS.GAME_LOBBY.GAME_STARTING, { seconds: 5 });

        room.gameStartTimer = setTimeout(async () => {
            room.gameStartTimer = null;
            const players = [...room.state.players.values()];
            const game_id = await createGame(players);

            room.lock();
            room.broadcast(EVENTS.GAME_LOBBY.GAME_STARTED, { game_id });
        }, 5000);
    },
    [EVENTS.GAME_LOBBY.METADATA_CHANGE]: async (room, client, message) => {
        const value = message.newKey;

        console.log("Updating metadata with:", value);

        await room.setMetadata({
            ...room.metadata,
            test: value
        });

        console.log(room.metadata);
        client.send(EVENTS.GAME_LOBBY.METADATA_CHANGE, room.metadata);           
    }
};