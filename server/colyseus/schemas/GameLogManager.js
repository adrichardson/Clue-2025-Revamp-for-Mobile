import { randomUUID } from "crypto";
import { EVENTS, GAME_LOG_TYPES } from "../../../shared/data/index.js";

export default class GameLogManager {
    constructor(room) {
        this.room = room;
        this.entries = [];
        this.privateEntries = new Map();
    }

    add(type, data = {}) {
        const log = {
            id: randomUUID(),
            turn: this.room.state.turn,
            timestamp: Date.now(),
            type,
            ...data
        };

        this.entries.push(log);
        this.room.broadcast(EVENTS.SERVER.GAME_LOG, log);
        return log;
    }

    // Add a private log entry for a single player (persisted for reconnect replay)
    addPrivate(player, type, data = {}) {
        const playerId = player.user_id;
        const log = {
            id: randomUUID(),
            turn: this.room.state.turn,
            timestamp: Date.now(),
            type,
            ...data
        };

        const list = this.privateEntries.get(playerId) || [];
        list.push(log);
        this.privateEntries.set(playerId, list);

        // Send immediately to the player if connected
        this.room.sendToPlayer(player, EVENTS.SERVER.GAME_LOG, log);
        return log;
    }

    getAll() {
        return [...this.entries];
    }

    getPrivateFor(playerId) {
        return [...(this.privateEntries.get(playerId) || [])];
    }

    getSince(index) {
        return this.entries.slice(index);
    }

    clear() {
        this.entries.length = 0;
    }

    playerJoined(player) {
        this.add(GAME_LOG_TYPES.PLAYER_JOINED, { player });
    }

    playerLeft(player) {
        this.add(GAME_LOG_TYPES.PLAYER_LEFT, { player });
    }

    characterChanged(player) {
        this.add(GAME_LOG_TYPES.CHARACTER_CHANGED, { player });
    }

    readyChanged(player) {
        this.add(GAME_LOG_TYPES.READY_CHANGED, { player,  ready: player.readystate });
    }

    roll(player, roll) {
        this.add(GAME_LOG_TYPES.ROLL, { player, roll });
    }

    newTurn(player) {
        this.add(GAME_LOG_TYPES.NEW_TURN, { player });
    }

    suggestion(player, suggestion) {
        this.add(GAME_LOG_TYPES.SUGGESTION, { player, suggestion });
    }

    playerMoved(player, location, locationType) {
        this.add(GAME_LOG_TYPES.PLAYER_MOVED, { player, location, locationType });
    }

    playerPassed(player) {
        this.add(GAME_LOG_TYPES.PLAYER_PASSED, { player });
    }

    playerObjected(player, card) {
        this.add(GAME_LOG_TYPES.PLAYER_OBJECTED, { player, card });
    }

    accusation(player, accusation) {
        this.add(GAME_LOG_TYPES.ACCUSATION, { player, accusation });
    }

    incorrectAccusation(player, accusation) {
        this.add(GAME_LOG_TYPES.INCORRECT_ACCUSATION, { player, accusation });
    }

    criminalGotAway() {
        this.add(GAME_LOG_TYPES.CRIMINAL_GOT_AWAY, {});
    }
}