import { Deck } from "../schemas/Deck.js";
import { Card } from "../schemas/Card.js";
import { ALL_CARDS } from "../../../shared/data/index.js";

export function buildDeck() {
    const deck = new Deck();
    ALL_CARDS.forEach(c => {
        deck.addCard(new Card(c.name, c.type, c.imagetag, c.id));
    });

  return deck;
}