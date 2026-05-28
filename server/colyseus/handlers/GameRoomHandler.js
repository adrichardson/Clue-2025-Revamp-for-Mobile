import { PHASES, EVENTS, BOARD_GRAPH, SUSPECTS, WEAPONS, ROOMS, getReachableTiles, getReachableRooms, getBlockedTiles} from "../../../shared/data/index.js";
import { Suggestion } from "../schemas/Suggestion.js";

export const GameRoomHandlers = {
    [EVENTS.CLIENT.CHAT_MESSAGE]: (room, client, message) => {
        let user = message.user;
        let chatmessage = message.message;
        const player = room.state.getPlayer(user.user_id);
        room.broadcast(EVENTS.SERVER.CHAT_MESSAGE, { message: chatmessage, player: player });
    },   
    [EVENTS.CLIENT.NEW_TURN]: (room, client, message) => {
        room.nextTurn();  
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
        const objection = room.findObjection(client.player, fullguess);
        const movePlayer = room.findPlayerByCharacterId(message.suspectId);
        const moveCharacter = room.findCharacterByCharacterId(message.suspectId);

        console.log("Received suggestion from", client.player.username, ":", fullguess.suspect, fullguess.weapon, fullguess.room);     
        if(moveCharacter){
            let isInRoom = message.roomId == moveCharacter.currentRoomId;
            console.log("isinroom? ", isInRoom);
            moveCharacter.currentRoomId = isInRoom? moveCharacter.currentRoomId : message.roomId;            
            if (movePlayer) {
                movePlayer.calledIn = !isInRoom;
                console.log("moveplayer calledin: ", movePlayer.calledIn);                
            }
            console.log("moveCharacter currentRoomId: ", moveCharacter.currentRoomId);                
        }    

        if (objection) {
            console.log(objection.player.username," objects");
            fullguess.cards = objection.objections;     
            state.currentTurn.suggestion = fullguess;
            state.currentTurn.objectingPlayerId = objection.player.user_id;
            state.phase = PHASES.OBJECTION;                  
        } else {
            console.log("Nobody could object.");
            state.phase = PHASES.FINAL_SUGGESTION;        
        }
    },    
    [EVENTS.CLIENT.MOVED]: (room, client, data) => {    
        const state = room.state;
        let { tileId, roomId, stay, pass, passage } = data;
        
        client.player.calledIn = false;
        if (stay) {
            state.currentTurn.hasMoved = true;                 
            state.phase = PHASES.SUGGESTION;            
        }

        if (pass) {          
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
                state.characters.get(String(client.player.character_id)).currentTileId = tileId;             
                state.characters.get(String(client.player.character_id)).currentRoomId = null;
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

        // state.currentTurn.validMoves = { tiles: Array.from(movable), rooms: reachableRooms };
        room.sendToPlayer(client.player, EVENTS.SERVER.ROLL_RESULT, { player: client.player, roll: roll, validMoves: state.currentTurn.validMoves });
        room.sendToPlayers(client => client.player?.user_id !== state.currentTurn.currentPlayerId,  EVENTS.SERVER.ROLL_RESULT, { player: client.player, roll: roll })      
        //client.send(EVENTS.SERVER.ROLL_RESULT, { player: client.player, roll: roll, validMoves: state.currentTurn.validMoves });
        state.phase = PHASES.MOVE;

        console.log(
            `${client.player.username} rolled a ${roll}`
        );
    }, 
    [EVENTS.CLIENT.OBJECTED]: async (room, client, message) => {
        const { cardId, cardType } = message;
        const card = room.getPlayerCard(client.player, cardId, cardType);
        const currentPlayer = room.state.players.get(room.state.currentTurn.currentPlayerId);
        console.log("player", client.player.username, "objected with ", card);
        console.log("showing", card.name, " to player ", currentPlayer.username);
        room.sendToPlayer(currentPlayer, EVENTS.SERVER.OBJECTION_FOUND, { player: client.player, card });
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