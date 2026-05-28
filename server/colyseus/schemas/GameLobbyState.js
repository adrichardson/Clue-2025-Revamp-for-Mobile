import { Schema, MapSchema, defineTypes } from "@colyseus/schema";
import { Player } from "./Player.js";

export class GameLobbyState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.playersReady = false;
  }

  addPlayer(id, player) {
    this.players.set(id, player);
  }

  removePlayer(id) {
    this.players.delete(id);
  }

  getPlayer(id) {
    return this.players.get(id);
  }

  getCurrentPlayers() {
    return this.players.size;
  }
}

defineTypes(GameLobbyState, {
  players: { map: Player },
  playersReady: "boolean",
});