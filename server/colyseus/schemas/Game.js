import { Schema, type, defineTypes } from "@colyseus/schema";

class Game extends Schema {
  constructor(username = "", type = "", mode = "", maxplayers = "", password = "", game_id = "") {
    super();
    this.username = username;
    this.type = type;
    this.mode = mode;
    this.maxplayers = maxplayers;
    this.password = password;
    this.game_id = game_id;
  }
}

// Define schema fields + types
defineTypes(Game, {
    username: "string",
    type: "string",
    mode: "string",
    maxplayers: "int32",
    game_id: "string"
});

export { Game };

//this.state.addUser(client.sessionId, new Player("Alice", "u123", "char01", false));
