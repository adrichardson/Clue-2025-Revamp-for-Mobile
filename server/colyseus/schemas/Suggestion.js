import { Schema, ArraySchema, defineTypes } from "@colyseus/schema";
import { Card } from "./Card.js";

export class Suggestion extends Schema {
  constructor(suspect, weapon, room) {
    super();
    this.suspect = suspect;
    this.weapon = weapon;
    this.room = room;
    this.cards = new ArraySchema();
  }
}

defineTypes(Suggestion, {
  suspect: "string",
  weapon: "string",
  room: "string",
  cards: [Card],  
});