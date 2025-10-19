import { Schema, MapSchema, defineTypes } from "@colyseus/schema";
import { Player } from "./Player.js";

export class GameState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
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

defineTypes(GameState, {
  players: { map: Player },
});