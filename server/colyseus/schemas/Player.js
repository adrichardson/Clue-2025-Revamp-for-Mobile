import { Schema, type, defineTypes, ArraySchema } from "@colyseus/schema";
import { Card } from "./Card.js";

export class Player extends Schema {
  constructor(username = "", user_id = "", character_id = "", isSpectator = false, readystate = false) {
    super();
    this.username = username;
    this.user_id = user_id;
    this.character_id = character_id;
    this.isSpectator = isSpectator;
    this.readystate = readystate;
    this.calledIn = false;
    this.hand = new ArraySchema();
    this.eliminated = false;
    this.connected = true;
    this.hasJoined = false;
    this.victor = false;
  }
}

defineTypes(Player, {
  username: "string",
  user_id: "string",
  character_id: "int32",
  isSpectator: "boolean",
  readystate: "boolean",
  calledIn: "boolean",
  hand: [Card],
  eliminated: "boolean",  
  connected: "boolean",    
  hasJoined: "boolean",
  victor: "boolean"
});