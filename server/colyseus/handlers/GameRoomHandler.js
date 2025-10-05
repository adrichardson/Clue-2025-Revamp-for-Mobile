export const gameroomHandlers = {
    toggleReady: (client, state) => {
        const player = state.players.get(client.sessionId);
        if (player) {
        player.readystate = !player.readystate;
        }
    },
    selectCharacter: (client, state, message) => {
        const player = state.players.get(client.sessionId);
        if (player) {
        player.character_id = message.character_id;
        }
    },
    updatemetadata: async (room, client, message) => {
        const value = message.newKey;

        console.log("Updating metadata with:", value);

        await room.setMetadata({
            ...room.metadata,
            test: value
        });

        console.log(room.metadata);
    },  
};