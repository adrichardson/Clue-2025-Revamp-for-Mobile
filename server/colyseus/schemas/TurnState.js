import { Schema, defineTypes } from "@colyseus/schema";
import { Suggestion } from "./Suggestion.js";
import { ValidMoves } from "./ValidMoves.js";

export class TurnState extends Schema {
  constructor() {
    super();
    this.currentPlayerId = "";    
    this.diceRoll = 0;
    this.hasMoved = false;
    this.hasSuggested = false; 
    this.suggestion = new Suggestion();
    this.objectingPlayerId = "";
    this.validMoves = new ValidMoves();
  }
}

defineTypes(TurnState, {
  currentPlayerId: "string",
  diceRoll: "number",
  hasMoved: "boolean",
  hasSuggested: "boolean",
  suggestion: Suggestion,
  objectingPlayerId: "string", 
  validMoves: ValidMoves
});