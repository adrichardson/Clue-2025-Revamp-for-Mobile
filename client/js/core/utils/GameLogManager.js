import MessageManager from "./MessageManager.js";
import { FEED_TYPES } from "../../../../shared/data/index.js";

class GameLogManager {

    add(entry) {
        MessageManager.add({
            feedType: FEED_TYPES.GAME_LOG,
            message: entry.message,
            italic: true
        });
    }

    load(entries) {
        MessageManager.load(FEED_TYPES.GAME_LOG, entries);
    }

    clear() {
        MessageManager.clear(FEED_TYPES.GAME_LOG);
    }
}

export default new GameLogManager();