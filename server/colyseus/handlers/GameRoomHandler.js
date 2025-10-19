export const GameRoomHandlers = {
    chatmessage: (room, client, message) => {
        let user = message.user;
        let chatmessage = message.message;
        const player = room.state.getPlayer(user.user_id);
        room.broadcast("chatmessage", { message: chatmessage, player: player });
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
    }
};