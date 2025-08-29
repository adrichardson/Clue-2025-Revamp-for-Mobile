import { Schema, MapSchema } from "@colyseus/schema";
import { Player } from "./Player.js";

export class GameState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
  }

  addPlayer(id) {
    this.players.set(id, new Player());
  }

  removePlayer(id) {
    this.players.delete(id);
  }

  static $schema = {
    players: { type: "map", valueType: Player }
  };
}
