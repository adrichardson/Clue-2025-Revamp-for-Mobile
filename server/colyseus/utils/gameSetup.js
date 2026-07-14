import { Deck } from "../schemas/Deck.js";
import { Card } from "../schemas/Card.js";

export function extractSolution(deck) {
  let person, weapon, room;

  for (let i = deck.cards.length - 1; i >= 0; i--) {
    const card = deck.cards[i];

    if (!person && card.type === "people") {
      person = card;
      deck.cards.splice(i, 1);
    } else if (!weapon && card.type === "weapons") {
      weapon = card;
      deck.cards.splice(i, 1);
    } else if (!room && card.type === "rooms") {
      room = card;
      deck.cards.splice(i, 1);
    }

    if (person && weapon && room) break;
  }

  return { person, weapon, room };
}

export function dealCards(deck, playersMap) {
  const players = [...playersMap.values().filter(player => !player.isSpectator)];
  let playerIndex = 0;

  while (deck.cards.length > 0) {
    const card = deck.draw();
    const player = players[playerIndex];
    player.hand.push(card);

    playerIndex = (playerIndex + 1) % players.length;
  }
}