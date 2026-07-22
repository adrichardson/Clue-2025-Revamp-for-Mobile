import { Schema, MapSchema, defineTypes } from "@colyseus/schema";
import { Player } from "./Player.js";
import { TurnState } from "./TurnState.js";
import { CharacterState } from "./CharacterState.js";
import { PHASES } from "../../../shared/data/index.js";

export class GameState extends Schema {
  constructor() {
    super();

    this.players = new MapSchema();
    this.characters = new MapSchema();
    this.turn = 1;
    this.phase = "";
    this.currentTurn = new TurnState();
    this.playerwinner = false;
  }

  addPlayer(id, player) {
    this.players.set(id, player);
  }

  removePlayer(id) {
    this.players.delete(id);
  }

  getPlayer(id) {
    return this.players.get(id);
  }

  getCurrentPlayers() {
    return this.players.size;
  }

  resetTurn() {
    const t = this.currentTurn;

    t.diceRoll = 0;
    t.hasMoved = false;
    t.hasSuggested = false;
    t.suggestion.suspect = "";
    t.suggestion.weapon = "";
    t.suggestion.room = "";
  }
}

defineTypes(GameState, {
  players: { map: Player },
  characters: { map: CharacterState },  
  turn: "number",
  playerwinner: "boolean",
  phase: "string",
  currentTurn: TurnState,
});