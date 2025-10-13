import { Schema, type, defineTypes } from "@colyseus/schema";

class Player extends Schema {
  constructor(username = "", user_id = "", character_id = "", readystate = false) {
    super();
    this.username = username;
    this.user_id = user_id;
    this.character_id = character_id;
    this.readystate = readystate;
  }
}

defineTypes(Player, {
  username: "string",
  user_id: "string",
  character_id: "int32",
  readystate: "boolean",
});

export { Player };