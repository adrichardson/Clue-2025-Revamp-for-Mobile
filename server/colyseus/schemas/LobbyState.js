import { Schema, MapSchema, defineTypes } from "@colyseus/schema";
import { User } from "./User.js";
import { Game } from "./Game.js";

export class LobbyState extends Schema {
  constructor() {
    super();
    this.activeusers = new MapSchema();
    this.activegames = new MapSchema();
  }

  addUser(user) {
    this.activeusers.set(user.user_id, user);
  }

  removeUser(user_id) {
    this.activeusers.delete(user_id);
  }

  getUser(user_id) {
    return this.activeusers.get(user_id);
  }

  addGame(game) {
    this.activegames.set(game.game_id, game);
  }

  removeGame(game_id) {
    this.activegames.delete(game_id);
  }

  getGame(game_id) {
    return this.activegames.get(game_id);
  }
}

defineTypes(LobbyState, {
  activeusers: { map: User },
  activegames: { map: Game }
});
