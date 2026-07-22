import { getUser } from "./user.js";
import { colyseus } from "../colyseus.js";
import { EVENTS } from "../../../../shared/data/index.js";

class ChatManager {

    async sendMessage() {
        const chatbox = document.getElementById("chatsendbox");
        if (!chatbox) return;

        const message = chatbox.value.trim();
        if (!message) return;

        chatbox.value = "";
        colyseus.send(EVENTS.CLIENT.CHAT_MESSAGE, {
            user: await getUser(),
            message
        });
    }
}

export default new ChatManager();