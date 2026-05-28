import { Schema, ArraySchema, defineTypes } from "@colyseus/schema";
import { Card } from "./Card.js";

export class Deck extends Schema {
  constructor() {
    super();
    this.cards = new ArraySchema();
  }

  addCard(card) {
    this.cards.push(card);
  }

  draw() {
    return this.cards.shift(); // top of deck
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
}

defineTypes(Deck, {
  cards: [Card],
});