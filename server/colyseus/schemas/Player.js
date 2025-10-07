import { Schema, type, defineTypes } from "@colyseus/schema";

class Player extends Schema {
  constructor(username = "", user_id = "", character_id = 0, readystate = false) {
    super();
    this.username = username;
    this.user_id = user_id;
    this.character_id = character_id;
    this.readystate = readystate;
  }
}

// Define schema fields + types
defineTypes(Player, {
  username: "string",
  user_id: "string",
  character_id: "int32",
  readystate: "boolean",
});

export { Player };

//this.state.addUser(client.sessionId, new Player("Alice", "u123", "char01", false));
