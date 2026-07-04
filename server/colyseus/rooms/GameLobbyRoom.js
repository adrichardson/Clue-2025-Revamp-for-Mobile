import { Room } from "colyseus";
import { GameLobbyState } from "../schemas/GameLobbyState.js";
import { GameLobbyRoomHandlers } from "../handlers/GameLobbyRoomHandler.js";
import { Player } from "../schemas/Player.js";
import { EVENTS } from "../../../shared/data/index.js";

export class GameLobbyRoom extends Room {
  onCreate(game) {
    this.autoDispose = false;
    this.state  = new GameLobbyState();

    this.setMetadata({
        owner: game.owner,
        type: game.type,
        mode: game.mode,
        maxplayers: game.maxplayers,
        password: game.password,
        gamelobby_id: this.roomId
    });  

    console.log("GameLobbyRoom ("+ this.roomId +") created!");

    for (const [msg, handler] of Object.entries(GameLobbyRoomHandlers)) {
      this.onMessage(msg, (client, message) => {
        handler(this, client, message);
      });
    }  
  }

  getNextAvailableCharacter(maxCharacters = 6) {
    const taken = new Set([...this.state.players.values()].map(p => p.character_id));

    for (let i = 0; i < maxCharacters; i++) {
      if (!taken.has(i)) return i;
    }

    return -1; // none available
  }

  areAllPlayersReady() {
    //TODO REMOVE FOR TESTING ADD FOR PROD
    // if (this.state.players.size < 3) return false;

    for (let player of this.state.players.values()) {
      if (!player.readystate) return false;
    }

    return true;
  }

  updatePlayersReady() {
    this.state.playersReady = this.areAllPlayersReady();
  }  
  
  onJoin(client, options) {
    const { user } = options;
    const username = user.username;
    const user_id = user.user_id;
    
    try {
      let character_id = this.getNextAvailableCharacter();
      let player = new Player(username, user_id, character_id, false);
      this.state.addPlayer(user_id, player);
      client.player = player;

      console.log("player " + username + " joined game lobby: " + this.roomId);      

      client.send(EVENTS.GAME_LOBBY.METADATA_CHANGE, this.metadata);

      player.user_id = user_id;

      this.updatePlayersReady();

      if (global.lobbyRoom) {
        global.lobbyRoom.broadcast(EVENTS.MAINLOBBY.REFRESH_GAMES);
      }    
      
    } catch (err) {
      console.error("Error in onJoin:", err);
    }
  }

  async onLeave(client) {
    const leavingPlayer = this.state.getPlayer(client.player.user_id);
    if (!leavingPlayer) return;

    console.log(leavingPlayer.username + " disconnected from game lobby: " + this.roomId);

    const wasOwner = this.metadata.owner === leavingPlayer.username;

    this.state.removePlayer(client.player.user_id);

    if (wasOwner && this.state.players.size > 0) {
      const nextPlayer = this.state.players.values().next().value;

      if (nextPlayer) {
        await this.setMetadata({
          ...this.metadata,
          owner: nextPlayer.username
        });

        console.log("New owner assigned:", nextPlayer.username);

        this.broadcast(EVENTS.GAME_LOBBY.OWNER_CHANGE, {
          username: nextPlayer.username
        });
      }
    }

    this.updatePlayersReady();

    if (this.state.players.size === 0) {
      console.log("No Players. Shutting down room:", this.roomId);
      this.disconnect();
    }

    if (global.lobbyRoom) {
      global.lobbyRoom.broadcast(EVENTS.MAINLOBBY.REFRESH_GAMES);
    }          
  }
}
