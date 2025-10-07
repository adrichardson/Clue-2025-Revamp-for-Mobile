export const gameroomHandlers = {
    toggleready: (room, client, message) => {
        let user = message.user;
        const player = room.state.getPlayer(user.user_id);
        if (player) {
            player.readystate = !player.readystate;
        }
    },
    selectcharacter: (room, client, message) => {
        let user = message.user;        
        const player = room.state.getPlayer(user.user_id);
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
        client.send("metadata", this.metadata);           
    },  
};