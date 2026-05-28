import { Room } from "colyseus";
import { GameState } from "../schemas/GameState.js";
import { GameRoomHandlers } from "../handlers/GameRoomHandler.js";
import { Player } from "../schemas/Player.js";
import { CharacterState } from "../schemas/CharacterState.js";
import { buildDeck } from "../utils/deckBuilder.js";
import { extractSolution, dealCards } from "../utils/gameSetup.js";
import { PHASES, EVENTS, CHARACTERS } from "../../../shared/data/index.js";

export class GameRoom extends Room {
  onCreate(gamedata) {
    this.autoDispose = false;
    this.state  = new GameState();

    //init character tiles
    for (const character of CHARACTERS) {
      const characterState = new CharacterState(character.id);
      characterState.currentTileId = `${character.startTile.x},${character.startTile.y}`;
      this.state.characters.set(character.id, characterState);
    }

    if (gamedata.players) {
      gamedata.players.forEach(p => {
        const player = new Player(
          p.username,
          p.user_id,
          p.character_id,
          false
        );

        this.state.addPlayer(p.user_id, player);
      });
    }

    this.setPlayerOrder(gamedata.players);

    // GAME SETUP
    const deck = buildDeck();

    this.solution = extractSolution(deck);
    deck.shuffle();

    dealCards(deck, this.state.players);

    console.log("GameRoom (" + this.roomId + ") created!");

    for (const [msg, handler] of Object.entries(GameRoomHandlers)) {
      this.onMessage(msg, (client, message) => {
        handler(this, client, message);
      });
    }
  }

  onJoin(client, options) {
      const user = options.user;
      const player = this.state.players.get(user.user_id);

      if (player) {
        client.player = player;
        console.log("player " + player.username + " joined game room: " + this.roomId);        
      } else {
        console.warn("Player not found in game state:", user.user_id);
      }

      if (this.clients.length === this.state.players.size) {
        this.startGame();
      }      
  }

  async onLeave(client) {
    let player = this.state.getPlayer(client.player.user_id);
    console.log(player.username + " disconnected from game room: " + this.roomId);
    //this.state.removePlayer(client.player.user_id);  //TODO HANDLE DISCONNECTS WITH REJOINS
    client.send(EVENTS.GAME_LOBBY.DISCONNECT);
  }

  getClientByPlayerId(playerId) {
    return this.clients.find(client => String(client.player?.user_id) === String(playerId));
  }
  

  findPlayerByCharacterId(characterId) {
    console.log("searching for", characterId);

    for (const player of this.state.players.values()) {
      console.log(player.username, player.character_id);
    }
    return Array.from(this.state.players.values()).find(player =>Number(player.character_id) === Number(characterId));
  }

  findCharacterByCharacterId(characterId) {
    console.log("searching for", characterId);

    for (const character of this.state.characters.values()) {
      console.log(character.currentRoomId, character.character_id);
    }    
    return Array.from(this.state.characters.values()).find(character => character.character_id === Number(characterId));
  }
  sendToPlayer(player, event, data) {
    const client = this.getClientByPlayerId(player.user_id);
    if (!client) return;
    console.log("sending event", event, "to client", client.player.username);
    client.send(event, data);
  }

  sendToPlayers(filterFn, event, data) {
    for (const client of this.clients) {
      if (!filterFn(client)) {
        continue;
      }
      client.send(event, data);
    }
  }

  getPlayerCard(player, cardId, cardType) {
    return player.hand.find(card =>
      String(card.id) === String(cardId) &&
      card.type === cardType
    );
  }

  findObjection(suggestingPlayer, suggestion) {
    const order = this.playerOrder;
    const startIndex = order.indexOf(suggestingPlayer.user_id);

    // Check players clockwise
    for (let i = 1; i < order.length; i++) {

      const playerId = order[(startIndex + i) % order.length];
      const player = this.state.players.get(playerId);

      if (!player) continue;

      const matchingCards =
        player.hand.filter(card =>
          card.name === suggestion.suspect ||
          card.name === suggestion.weapon ||
          card.name === suggestion.room
        );

      if (matchingCards.length > 0) {
        return {
          player,
          objections: matchingCards
        };
      }
    }

    return null;
  }

  setPlayerOrder(players) {
    const scarlet = players.find(p => p.character_id === 0);

    let ordered;

    if (scarlet) {
      const others = players.filter(p => p.user_id !== scarlet.user_id);

      // shuffle others
      for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
      }

      ordered = [scarlet, ...others];

    } else {
      ordered = [...players];

      // shuffle all
      for (let i = ordered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
      }
    }

    this.playerOrder = ordered.map(p => p.user_id);
    console.log("player order is: ", this.playerOrder);
  }

  startGame() {
    if (this.state.currentTurn.currentPlayerId) return; // already started

    const playerIds = this.playerOrder;

    if (playerIds.length === 0) return;

    this.state.currentTurn.currentPlayerId = playerIds[0];
    this.state.turn = 1;
    this.state.phase = PHASES.TURN_START;

    this.resetTurn();

    console.log("Game started. First player:", this.state.getPlayer(this.state.currentTurn.currentPlayerId).username);
  }

  nextTurn() {
    const state = this.state;
    const ids = this.playerOrder;

    const currentIndex = ids.indexOf(state.currentTurn.currentPlayerId);
    const nextIndex = (currentIndex + 1) % ids.length;

    state.currentTurn.currentPlayerId = ids[nextIndex];
    state.turn++;

    this.resetTurn();
    state.phase = PHASES.TURN_START;
    console.log("Next player:", this.state.getPlayer(this.state.currentTurn.currentPlayerId).username);
  }  

  resetTurn() {
    const t = this.state.currentTurn;

    t.diceRoll = 0;
    t.hasMoved = false;
    t.hasSuggested = false;

    t.suggestion.suspect = "";
    t.suggestion.weapon = "";
    t.suggestion.room = "";
  }  
}
