import {Schema, ArraySchema, defineTypes } from "@colyseus/schema";

export class ValidMoves extends Schema {

  constructor() {
    super();

    this.tiles = new ArraySchema();
    this.rooms = new ArraySchema();
  }
}

defineTypes(ValidMoves, {
  tiles: ["string"],
  rooms: ["string"]
});