import { randomUUID } from "crypto";
import { PHASES, EVENTS, BOARD_GRAPH, SUSPECTS, WEAPONS, ROOMS, GAME_LOG_TYPES, getReachableTiles, getReachableRooms, getBlockedTiles} from "../../../shared/data/index.js";
import { Suggestion } from "../schemas/Suggestion.js";
import { saveGame } from "../../services/gameService.js";

export const GameRoomHandlers = {
    [EVENTS.CLIENT.CHAT_MESSAGE]: (room, client, message) => {
        let user = message.user;
        let chatmessage = message.message;
        const player = room.state.getPlayer(user.user_id);
        room.broadcast(EVENTS.SERVER.CHAT_MESSAGE, { message: chatmessage, player: player });
    },   
    [EVENTS.CLIENT.NEW_TURN]: (room, client, message) => {
        // If current phase allowed a final decision (everybody passed), and the current player
        // chose to end their turn, log that choice before advancing the turn.
        try {
            if (room.state.phase === PHASES.FINAL_POSSIBLE) {
                room.gameLog.add(GAME_LOG_TYPES.PLAYER_ENDED_TURN, { player: client.player });
            }
        } catch (e) {
            console.warn('Failed to log player ended turn:', e);
        }
        room.nextTurn();
    },
    [EVENTS.CLIENT.SHEET_UPDATE]: (room, client, message) => {
        const player = client.player;
        if (!player) {
            console.warn("Sheet update attempted without player.");
            return;
        }

        const sheet = room.playerSheets.get(player.user_id) || Array.from({ length: 105 }, () => ({ symbol: "", color: "black" }));
        if (message.clear) {
            for (let i = 0; i < sheet.length; i++) {
                sheet[i].symbol = "";
                sheet[i].color = "black";
            }
        } else if (message.mark && typeof message.mark.index === "number") {
            const { index, symbol, color } = message.mark;
            if (index >= 0 && index < sheet.length) {
                sheet[index].symbol = symbol || "";
                sheet[index].color = color || "black";
            }
        } else if (Array.isArray(message.marks)) {
            for (let i = 0; i < sheet.length && i < message.marks.length; i++) {
                const item = message.marks[i] || {};
                sheet[i].symbol = item.symbol || "";
                sheet[i].color = item.color || "black";
            }
        }

        room.playerSheets.set(player.user_id, sheet);
        room.sendToPlayer(player, EVENTS.SERVER.PLAYER_SHEET, { marks: sheet });
    },
    [EVENTS.CLIENT.SUGGESTED]: (room, client, message) => {
        const state = room.state;

        // validate player exists
        if (!client.player) {
            console.warn("Suggestion attempted without player.");
            return;
        }

        // validate current turn       
        if (state.currentTurn.currentPlayerId !== client.player.user_id) {
            console.warn("Not this player's turn.");
            return;
        }

        // validate phase
        if (state.phase !== PHASES.SUGGESTION) {
            console.warn("Cannot make suggestion during phase:", state.phase);
            return;
        }

        let character = state.characters.get(String(client.player.character_id));

        if (!character) {
            console.warn("Character not found for player:", client.player.character_id);
            return;
        }        

        const { suspectId, weaponId, roomId } = message;

        // validate suggestion completeness
        if (!suspectId || !weaponId || !roomId) {
            console.warn("Incomplete suggestion:", message);
            return;
        }

        if (character.currentRoomId != roomId) {
            console.warn("Player is not in the suggested room:", roomId);
            return;
        }

        const personguess = SUSPECTS.find(card => card.id === Number(message.suspectId)).name;
        const weaponguess = WEAPONS.find(card => card.id === Number(message.weaponId)).name;        
        const roomguess = ROOMS.find(card => card.imagetag === message.roomId).name;
        const fullguess = new Suggestion(personguess, weaponguess, roomguess);

        // Store a plain, serializable suggestion for game logs (avoid Schema instances)
        const plainSuggestion = {
            suspect: personguess,
            weapon: weaponguess,
            room: roomguess,
            cards: []
        };

        // Log the suggestion immediately so it appears before per-player pass/object logs
        room.gameLog.suggestion(client.player, plainSuggestion);

        const objection = room.findObjection(client.player, fullguess);
        const movePlayer = room.findPlayerByCharacterId(message.suspectId);
        const moveCharacter = room.findCharacterByCharacterId(message.suspectId);

        console.log("Received suggestion from", client.player.username, ":", fullguess.suspect, fullguess.weapon, fullguess.room);     
        if(moveCharacter){
            let isInRoom = message.roomId == moveCharacter.currentRoomId;

            moveCharacter.currentRoomId = isInRoom? moveCharacter.currentRoomId : message.roomId;            
            if (movePlayer) {
                movePlayer.calledIn = !isInRoom;
                console.log("moveplayer calledin: ", movePlayer.calledIn);                
            }
            console.log("moveCharacter currentRoomId: ", moveCharacter.currentRoomId);                
            // Log that the player was called into the room (public game log)
            if (movePlayer && movePlayer.calledIn) {
                const calledRoomName = ROOMS.find(r => r.imagetag === message.roomId)?.name || message.roomId;
                room.gameLog.add(GAME_LOG_TYPES.PLAYER_MOVED, { player: movePlayer, location: calledRoomName, locationType: 'room', action: 'calledin' });
            }
        }    

        if (objection) {
            console.log(objection.player.username," objects");
            fullguess.cards = objection.objections;     
            state.currentTurn.suggestion = fullguess;
            state.currentTurn.objectingPlayerId = objection.player.user_id;
            state.phase = PHASES.OBJECTION;                  
        } else {
            console.log("Nobody could object.");
            state.phase = PHASES.FINAL_POSSIBLE;
            // Public game log to indicate that no one could object to the suggestion
            try {
                room.gameLog.add(GAME_LOG_TYPES.EVERYBODY_PASSED, { player: client.player });
            } catch (e) {
                console.warn('Failed to log everybody passed:', e);
            }
        }
    },
    [EVENTS.CLIENT.MOVED]: (room, client, data) => {    
        const state = room.state;
        let { tileId, roomId, stay, pass, passage } = data;
        
        client.player.calledIn = false;
        if (stay) {
            state.currentTurn.hasMoved = true;
            try {
                const charState = state.characters.get(String(client.player.character_id));
                const stayedRoomId = charState?.currentRoomId;
                const stayedRoomName = stayedRoomId ? (ROOMS.find(r => r.imagetag === stayedRoomId)?.name || stayedRoomId) : null;
                if (stayedRoomName) {
                    room.gameLog.add(GAME_LOG_TYPES.PLAYER_MOVED, { player: client.player, location: stayedRoomName, locationType: 'room', action: 'stayed' });
                }
            } catch (e) {
                console.warn('Failed to log stay action:', e);
            }
            state.phase = PHASES.SUGGESTION;            
        }

        if (pass) {          
            room.gameLog.playerPassed(client.player);
            room.nextTurn();  
        }

        // validate player exists
        if (!client.player) {
            console.warn("Move attempted without player.");
            return;
        }

        // validate current turn       
        if (state.currentTurn.currentPlayerId !== client.player.user_id) {
            console.warn("Not this player's turn.");
            return;
        }

        // validate phase
        if (state.phase !== PHASES.MOVE && !passage) {
            console.warn("Cannot move during phase:", state.phase);
            return;
        }

        let character = state.characters.get(String(client.player.character_id));

        if (!character) {
            console.warn("Character not found for player:", client.player.character_id);
            return;
        }

        if (character.currentTileId == tileId && tileId != null) {
            console.warn("Player is already on this tile:", tileId);
            client.send(EVENTS.SERVER.PLAYER_INVALID_MOVE, { player: client.player, attemptedMove: { "type": "tile", "id": tileId } });            
            return;
        }

        const blockedTiles = getBlockedTiles(state.characters, character.character_id);   
        const { traversable, movable, distances } = getReachableTiles(BOARD_GRAPH, character.currentTileId, state.currentTurn.diceRoll, blockedTiles, character.currentRoomId);
        let reachableRooms = getReachableRooms(distances, state.currentTurn.diceRoll, character.currentRoomId);
        reachableRooms = passage? [...reachableRooms, roomId]: reachableRooms;
     
        //
        if( tileId ){
            console.log(movable);              
            if (!movable.has(tileId)) {
                console.log("Tile not reachable:", tileId, " from ", character.currentTileId);
                client.send(EVENTS.SERVER.PLAYER_INVALID_MOVE, { player: client.player, attemptedMove: { "type": "tile", "id": tileId } });
            } else {
                state.currentTurn.validMoves.tiles.clear();
                state.currentTurn.validMoves.rooms.clear();
                state.currentTurn.hasMoved = true;           
                // capture previous room before moving to a tile so the client can display "moved out of [previous room]"
                const prevRoomId = state.characters.get(String(client.player.character_id)).currentRoomId;
                const prevRoomName = prevRoomId ? (ROOMS.find(r => r.imagetag === prevRoomId)?.name || prevRoomId) : null;
                state.characters.get(String(client.player.character_id)).currentTileId = tileId;             
                state.characters.get(String(client.player.character_id)).currentRoomId = null;
                // Keep server log with exact tile, and include prevRoomName for client-friendly messaging
                room.gameLog.add(GAME_LOG_TYPES.PLAYER_MOVED, { player: client.player, location: `tile ${tileId}`, locationType: 'tile', prevRoomName });
                room.sendToPlayer(client.player, EVENTS.SERVER.PLAYER_VALID_MOVE, { player: client.player, validMove: { "type": "tile", "id": tileId } } );
                console.log(`${client.player.username} has moved to tile ${tileId}.`);
                room.nextTurn();       
            }  

        } else if (roomId) {
            console.log(reachableRooms);

            if (!reachableRooms.includes(roomId)) {
                console.log("Room not reachable:", roomId);
                client.send(EVENTS.SERVER.PLAYER_INVALID_MOVE, { player: client.player, attemptedMove: { type: "room", "id": roomId } });                
                //return invalid;
            } else {
                state.currentTurn.validMoves.tiles.clear();
                state.currentTurn.validMoves.rooms.clear();
                state.currentTurn.hasMoved = true;               
                state.characters.get(String(client.player.character_id)).currentTileId = null;                
                state.characters.get(String(client.player.character_id)).currentRoomId = roomId;                 
                state.phase = PHASES.SUGGESTION;
                const roomName = ROOMS.find(r => r.imagetag === roomId)?.name || roomId;
                const action = passage ? 'passage' : (stay ? 'stayed' : 'moved');
                room.gameLog.add(GAME_LOG_TYPES.PLAYER_MOVED, { player: client.player, location: roomName, locationType: 'room', action });
                room.sendToPlayer(client.player, EVENTS.SERVER.PLAYER_VALID_MOVE, { player: client.player, validMove: { type: "room", "id": roomId } });
                console.log(`${client.player.username} has moved to the ${roomId}.`);   
            } 
        }
    },
    [EVENTS.CLIENT.ROLLED]: (room, client) => {
        const state = room.state;

        // validate player exists
        if (!client.player) {
            console.warn("Roll attempted without player.");
            return;
        }

        // validate current turn
        if (state.currentTurn.currentPlayerId !== client.player.user_id) {
            console.warn("Not this player's turn.");
            return;
        }

        // validate phase
        if (state.phase !== PHASES.TURN_START) {
            console.warn("Cannot roll during phase:", state.phase);
            return;
        }

        // prevent double roll safety
        if (state.currentTurn.diceRoll > 0) {
            console.warn("Player already rolled this turn.");
            return;
        }

        // roll dice
        const roll = Math.floor(Math.random() * 6) + 1;

        // update turn state
        state.currentTurn.diceRoll = roll;
        room.gameLog.roll(client.player, roll);

        let character = state.characters.get(String(client.player.character_id));
        const blockedTiles = getBlockedTiles(state.characters, character.character_id);   
        const { traversable, movable, distances } = getReachableTiles(BOARD_GRAPH, character.currentTileId, state.currentTurn.diceRoll, blockedTiles, character.currentRoomId); 
        const reachableRooms = getReachableRooms(distances, state.currentTurn.diceRoll, character.currentRoomId);

        state.currentTurn.validMoves.tiles.clear();
        state.currentTurn.validMoves.rooms.clear();

        for (const tile of movable) {
            state.currentTurn.validMoves.tiles.push(tile);
        }

        for (const room of reachableRooms) {
            state.currentTurn.validMoves.rooms.push(room);
        }

        room.sendToPlayer(client.player, EVENTS.SERVER.ROLL_RESULT, { player: client.player, roll: roll, validMoves: state.currentTurn.validMoves });
        room.sendToPlayers(client => client.player?.user_id !== state.currentTurn.currentPlayerId,  EVENTS.SERVER.ROLL_RESULT, { player: client.player, roll: roll });     
        state.phase = PHASES.MOVE;
    }, 
    [EVENTS.CLIENT.OBJECTED]: async (room, client, message) => {
        const { cardId, cardType } = message;
        const card = room.getPlayerCard(client.player, cardId, cardType);
        const currentPlayer = room.state.players.get(room.state.currentTurn.currentPlayerId);
        console.log("player", client.player.username, "objected with ", card);
        console.log("showing", card.name, " to player ", currentPlayer.username);

            // Create a public log entry that does NOT include the card details.
            room.gameLog.add(GAME_LOG_TYPES.PLAYER_OBJECTED, { player: client.player });

            // Private log for the player who should be shown the card (reveal the card).
            room.gameLog.addPrivate(currentPlayer, GAME_LOG_TYPES.PLAYER_OBJECTED, { player: client.player, card, view: 'revealed', target: currentPlayer });
        room.queuePrivateEvent(currentPlayer, EVENTS.SERVER.OBJECTION_FOUND, { player: client.player, card });

        for (const player of room.state.players.values()) {
            if (player.user_id === currentPlayer.user_id) continue;
            room.queuePrivateEvent(player, EVENTS.SERVER.OBJECTION_SHOWN, { player: client.player, currplayer: currentPlayer });
        }
        
            // Private log for the player who showed the card (so they see "you showed [card] to [player]").
            room.gameLog.addPrivate(client.player, GAME_LOG_TYPES.PLAYER_OBJECTED, { player: client.player, card, view: 'shower', target: currentPlayer });
        
            // Notify all other players that an objection occurred (without card details).
            for (const player of room.state.players.values()) {
                if (player.user_id === currentPlayer.user_id) continue;
                if (player.user_id === client.player.user_id) continue; // already sent to shower
                room.queuePrivateEvent(player, EVENTS.SERVER.OBJECTION_SHOWN, { player: client.player, currplayer: currentPlayer });
            }
    },
    [EVENTS.CLIENT.CHOOSE_FINAL]: async (room, client, message) => {
        const currentPlayer = room.state.players.get(room.state.currentTurn.currentPlayerId);
        console.log(currentPlayer.username, " is making a final");
        try {
            room.gameLog.add(GAME_LOG_TYPES.PLAYER_CHOSE_FINAL, { player: currentPlayer });
        } catch (e) {
            console.warn('Failed to log player chose final:', e);
        }
        room.state.phase = PHASES.FINAL_SUGGESTION;
    },
    [EVENTS.CLIENT.SUBMIT_FINAL]: async (room, client, message) => {
        const { suspectId, weaponId, roomId } = message;
        const solution = room.solution;
        console.log("checking final guess against solution", solution.person.name, solution.weapon.name, solution.room.imagetag);
        const isCorrect =
            solution.person.id === Number(suspectId) &&
            solution.weapon.id === Number(weaponId) &&
            solution.room.imagetag === roomId;         
        const currentPlayer = room.state.players.get(room.state.currentTurn.currentPlayerId);
        const fullsolution = new Suggestion(room.solution.person.name, room.solution.weapon.name, room.solution.room.name);
        fullsolution.cards.push(room.solution.person, room.solution.weapon, room.solution.room);
        room.gameLog.accusation(currentPlayer, fullsolution);

        if (isCorrect) {
            console.log(`${currentPlayer.username} solved the mystery!`);
            currentPlayer.victor = true;
            room.state.currentTurn.suggestion = fullsolution;
            await saveGame(Array.from(room.state.players.values()), room.gameLog.getAll());
            room.state.playerwinner = true;
            room.state.phase = PHASES.GAME_OVER;
        } else {
            console.log(`${currentPlayer.username} made an incorrect accusation.`);
            room.gameLog.incorrectAccusation(currentPlayer, fullsolution);
            room.state.phase = PHASES.FINAL_FAILED;
            currentPlayer.eliminated = true;
        }
    },    
    [EVENTS.GAME_LOBBY.METADATA_CHANGE]: async (room, client, message) => {
        const value = message.newKey;

        console.log("Updating metadata with:", value);

        await room.setMetadata({
            ...room.metadata,
            test: value
        });

        client.send(EVENTS.GAME_LOBBY.METADATA_CHANGE, this.metadata);
    }
};