import { Schema, defineTypes } from "@colyseus/schema";

export class CharacterState extends Schema {
  constructor(character_id = 0) {
    super();

    this.character_id = character_id;
    this.currentTileId = "";
    this.currentRoomId = "";
  }
}

defineTypes(CharacterState, {
  character_id: "int32",
  currentTileId: "string",
  currentRoomId: "string"
});