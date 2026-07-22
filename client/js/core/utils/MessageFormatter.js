import { getUser } from "./user.js";
import { getCharacterHexColorById, getCharacterAltTagById } from "./imagehelper.js";
import { FEED_TYPES, GAME_LOG_TYPES } from "../../../../shared/data/index.js";

class MessageFormatter {
    async formatGameLog(log) {
        switch (log.type) {
            case GAME_LOG_TYPES.PLAYER_JOINED:
                return this.formatPlayerJoined(log);
            case GAME_LOG_TYPES.PLAYER_LEFT:
                return this.formatPlayerLeft(log);
            case GAME_LOG_TYPES.READY_CHANGED:
                return this.formatReadyChanged(log);
            case GAME_LOG_TYPES.NEW_TURN:
                return this.formatNewTurn(log);
            case GAME_LOG_TYPES.SUGGESTION:
                return this.formatSuggestion(log);
            case GAME_LOG_TYPES.ACCUSATION:
                return this.formatAccusation(log);
            case GAME_LOG_TYPES.CHARACTER_CHANGED:
                return this.formatCharacterChanged(log);
            case GAME_LOG_TYPES.ROLL:
                return this.formatRoll(log);
            case GAME_LOG_TYPES.PLAYER_MOVED:
                return this.formatPlayerMoved(log);
            case GAME_LOG_TYPES.PLAYER_PASSED:
                return this.formatPlayerPassed(log);
            case GAME_LOG_TYPES.PLAYER_OBJECTED:
                return this.formatPlayerObjected(log);
            case GAME_LOG_TYPES.EVERYBODY_PASSED:
                return this.formatEverybodyPassed(log);
            case GAME_LOG_TYPES.PLAYER_CHOSE_FINAL:
                return this.formatPlayerChoseFinal(log);
            case GAME_LOG_TYPES.PLAYER_ENDED_TURN:
                return this.formatPlayerEndedTurn(log);
            case GAME_LOG_TYPES.INCORRECT_ACCUSATION:
                return this.formatIncorrectAccusation(log);
            case GAME_LOG_TYPES.CRIMINAL_GOT_AWAY:
                return this.formatCriminalGotAway(log);
            default:
                return this.formatGameLogMessage(`Game event: ${log.type}`);
        }
    }
    
    formatGameLogMessage(message) {
        return {
            type: FEED_TYPES.GAME_LOG,
            message,
            styles: {
                fontStyle: "italic",
                color: "#555555"
            }
        };
    }    

    async formatPlayerJoined(log) {
        const currentUser = await getUser();
        return this.formatGameLogMessage(log.player.user_id === currentUser.user_id ? "You joined the game." : `${log.player.username} joined the game.`);
    }

    async formatReadyChanged(log) {
        const currentUser = await getUser();
        const player = log.player;

        const isYou = player.user_id === currentUser.user_id;
        const character = getCharacterAltTagById(player.character_id);

        return this.formatGameLogMessage(
            isYou
                ? `You (${character}) ${player.readystate ? "are" : "are not"} ready.`
                : `${player.username} (${character}) ${player.readystate ? "is" : "is not"} ready.`
        );
    }    

    async formatPlayerLeft(log) {
        const currentUser = await getUser();
        return this.formatGameLogMessage(log.player.user_id === currentUser.user_id ? "You left the game." : `${log.player.username} left the game.`);
    }

    async formatCharacterChanged(log) {
        const currentUser = await getUser();
        const player = log.player;
        const character = getCharacterAltTagById(player.character_id);
        return this.formatGameLogMessage(
            player.user_id === currentUser.user_id
                ? `You changed to ${character}.`
                : `${player.username} changed to ${character}.`
        );
    }

    async formatSuggestion(log) {
        const currentUser = await getUser();
        const player = log.player;
        const isYou = player.user_id === currentUser.user_id;
        const accusation = log.suggestion;
        return this.formatGameLogMessage(
            isYou
                ? `You suggested ${accusation.suspect} with the ${accusation.weapon} in the ${accusation.room}.`
                : `${player.username} suggested ${accusation.suspect} with the ${accusation.weapon} in the ${accusation.room}.`
        );
    }

    async formatAccusation(log) {
        const currentUser = await getUser();
        const player = log.player;
        const isYou = player.user_id === currentUser.user_id;
        const accusation = log.accusation;
        return this.formatGameLogMessage(
            isYou
                ? `You accused ${accusation.suspect} with the ${accusation.weapon} in the ${accusation.room}.`
                : `${player.username} accused ${accusation.suspect} with the ${accusation.weapon} in the ${accusation.room}.`
        );
    }

    async formatRoll(log) {
        const currentUser = await getUser();
        const player = log.player;
        const isYou = player.user_id === currentUser.user_id;
        return this.formatGameLogMessage(
            isYou
                ? `You rolled a ${log.roll}.`
                : `${player.username} rolled a ${log.roll}.`
        );
    }

    async formatNewTurn(log) {
        const currentUser = await getUser();
        const player = log.player;
        const isYou = player.user_id === currentUser.user_id;
        return this.formatGameLogMessage(
            isYou
                ? `Turn ${log.turn}: It's your turn.`
                : `Turn ${log.turn}: It's ${player.username}'s turn.`
        );
    }

    async formatPlayerMoved(log) {
        const currentUser = await getUser();
        const player = log.player;
        const isYou = player.user_id === currentUser.user_id;
        const location = log.location || 'unknown location';

            // If this was a tile move, prefer a client-friendly message using prevRoomName.
            // If no prevRoomName is available, do not show tile coordinates—just say 'moved'.
            if (log.locationType === 'tile') {
                if (log.prevRoomName) {
                    return this.formatGameLogMessage(
                        isYou
                            ? `You moved out of ${log.prevRoomName}.`
                            : `${player.username} moved out of ${log.prevRoomName}.`
                    );
                }
                return this.formatGameLogMessage(isYou ? `You moved.` : `${player.username} moved.`);
            }

            // If this was a room move, check for actions like 'calledin', 'stayed', or 'passage'
            if (log.locationType === 'room') {
                const roomName = log.location || 'the room';
                if (log.action === 'calledin') {
                    return this.formatGameLogMessage(isYou ? `You were called into the ${roomName}.` :`${player.username} was called into the ${roomName}.`);
                }
                if (log.action === 'stayed') {
                    return this.formatGameLogMessage(isYou ? `You stayed in the ${roomName}.` : `${player.username} stayed in the ${roomName}.`);
                }
                if (log.action === 'passage') {
                    return this.formatGameLogMessage(isYou ? `You took a secret passage to the ${roomName}!` : `${player.username} took a secret passage to the ${roomName}!`);
                }
                return this.formatGameLogMessage(
                    isYou
                        ? `You moved to the ${location}.`
                        : `${player.username} moved to the ${location}.`
                );
            }

            return this.formatGameLogMessage(
                isYou
                    ? `You moved to ${location}.`
                    : `${player.username} moved to ${location}.`
            );
    }

    async formatPlayerPassed(log) {
        const currentUser = await getUser();
        const player = log.player;
        const isYou = player.user_id === currentUser.user_id;
        return this.formatGameLogMessage(
            isYou
                ? `You passed.`
                : `${player.username} passed.`
        );
    }

    async formatPlayerObjected(log) {
        const currentUser = await getUser();
        const player = log.player;
        const isYou = player.user_id === currentUser.user_id;
        const cardName = log.card?.name;

        // Shower view: the player who showed the card sees "You showed [card] to [player]"
        if (log.view === 'shower') {
            const target = log.target;
            return this.formatGameLogMessage(
                isYou
                    ? `You showed ${cardName} to ${target.username}.`
                    : `${player.username} showed ${cardName} to ${target.username}.`
            );
        }

        // Revealed to target: target sees the card privately
        if (cardName && log.view === 'revealed') {
            const target = log.target;
            if (target && target.user_id === currentUser.user_id) {
                return this.formatGameLogMessage(`You were shown ${cardName} by ${player.username}.`);
            }
            // Fallback for anyone else who somehow receives card info
            return this.formatGameLogMessage(`${player.username} objected.`);
        }

        // Public/generic objection (no card details)
        return this.formatGameLogMessage(isYou ? `You objected.` : `${player.username} objected.`);
    }

    async formatEverybodyPassed(log) {
        // Public announcement that no one could object to the suggestion
        return this.formatGameLogMessage(`Everybody has passed!`);
    }

    async formatPlayerChoseFinal(log) {
        const currentUser = await getUser();
        const player = log.player;
        const isYou = player.user_id === currentUser.user_id;
        return this.formatGameLogMessage(isYou ? `You chose to make a final accusation.` : `${player.username} chose to make a final accusation.`);
    }

    async formatPlayerEndedTurn(log) {
        const currentUser = await getUser();
        const player = log.player;
        const isYou = player.user_id === currentUser.user_id;
        return this.formatGameLogMessage(isYou ? `You ended your turn without making a final accusation.` : `${player.username} ended their turn without making a final accusation.`);
    }

    async formatIncorrectAccusation(log) {
        const currentUser = await getUser();
        const player = log.player;
        const isYou = player.user_id === currentUser.user_id;
        const accusation = log.accusation;
        const baseMessage = isYou
            ? `You accused ${accusation.suspect} with the ${accusation.weapon} in the ${accusation.room} incorrectly.`
            : `${player.username} accused ${accusation.suspect} with the ${accusation.weapon} in the ${accusation.room} incorrectly.`;
        return this.formatGameLogMessage(
            isYou
                ? `${baseMessage} You are no longer in the game to win, but you can still object.`
                : `${baseMessage} ${player.username} is no longer in the game to win, but can still object.`
        );
    }

    async formatCriminalGotAway(log) {
        return this.formatGameLogMessage(`Everybody guessed wrong and the criminal got away with the murder.`);
    }

    async formatChatMessage(message, player) {
        const currentUser = await getUser();

        let username = "";
        let color = "#333333";

        if (player?.character_id !== undefined) {
            const characterName = getCharacterAltTagById(player.character_id);
            color = getCharacterHexColorById(player.character_id);
            username = player.user_id === currentUser.user_id  ? `You (${characterName}): ` : `${player.username} (${characterName}): `;
        } else if (typeof player === "string") {
            username =  player === currentUser.username  ? "You: " : `${player}: `;
        }   

        return {
            type: FEED_TYPES.PLAYER_MESSAGE,
            username,
            color,
            message
        };
    }
}

export default new MessageFormatter();
