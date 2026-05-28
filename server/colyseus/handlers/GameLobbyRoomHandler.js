import { createGame } from "../../services/gameService.js";
import { EVENTS } from "../../../shared/data/index.js";

export const GameLobbyRoomHandlers = {
    [EVENTS.GAME_LOBBY.READYSTATE_CHANGE]: (room, client, message) => {
        let user = message.user;
        const player = room.state.getPlayer(user.user_id);
        if (player) {
            player.readystate = !player.readystate;        
        }

        room.updatePlayersReady();            
        //notifcations handled in client state change listener  
    },
    [EVENTS.GAME_LOBBY.CHARACTER_CHANGE]: (room, client, message) => {
        let user = message.user;        
        const player = room.state.getPlayer(user.user_id);
        if (player) {
            player.character_id = message.character_id;
        }

        room.updatePlayersReady();        
    },
    [EVENTS.CLIENT.CHAT_MESSAGE]: (room, client, message) => {
        let user = message.user;
        let chatmessage = message.message;
        const player = room.state.getPlayer(user.user_id);        
        room.broadcast(EVENTS.SERVER.CHAT_MESSAGE, { message: chatmessage, player : player });
    },
    startgame: async (room, client, message) => {
        let user = message.user; 

        if (!user.username == room.metadata.owner) return;

        if (!room.state.playersReady) return;

        const players = [...room.state.players.values()];
        const game_id = await createGame(players);

        room.lock();
        room.broadcast(EVENTS.GAME_LOBBY.GAME_STARTED, { game_id });
    },
    [EVENTS.GAME_LOBBY.METADATA_CHANGE]: async (room, client, message) => {
        const value = message.newKey;

        console.log("Updating metadata with:", value);

        await room.setMetadata({
            ...room.metadata,
            test: value
        });

        console.log(room.metadata);
        client.send(EVENTS.GAME_LOBBY.METADATA_CHANGE, this.metadata);           
    }
};