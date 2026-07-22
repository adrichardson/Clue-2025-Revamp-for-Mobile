import { Room } from "colyseus";
import { GameState } from "../schemas/GameState.js";
import { GameRoomHandlers } from "../handlers/GameRoomHandler.js";
import { Player } from "../schemas/Player.js";
import GameLogManager from "../schemas/GameLogManager.js";
import { CharacterState } from "../schemas/CharacterState.js";
import { buildDeck } from "../utils/deckBuilder.js";
import { extractSolution, dealCards } from "../utils/gameSetup.js";
import { PHASES, EVENTS, CHARACTERS } from "../../../shared/data/index.js";
import { Card } from "../schemas/Card.js";
import { saveGame } from "../../services/gameService.js";
import { Suggestion } from "../schemas/Suggestion.js";

const SHEET_CELL_COUNT = 105;

function createEmptySheet() {
  return Array.from({ length: SHEET_CELL_COUNT }, () => ({ symbol: "", color: "black" }));
}

export class GameRoom extends Room {
  onCreate(gamedata) {
    this.autoDispose = false;
    this.state  = new GameState();
    this.gameLog = new GameLogManager(this);
    this.playerPendingEvents = new Map();
    this.playerSheets = new Map();

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
          p.isSpectator,
          false
        );

        this.state.addPlayer(p.user_id, player);
      });
    }

    this.setPlayerOrder(gamedata.players);

    // GAME SETUP
    const deck = buildDeck();
    deck.shuffle();
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

      if (!player) {
        console.warn("Player not found:", user.user_id);
        return;
      }
      const isReconnect = player.hasJoined;

      player.connected = true;
      player.hasJoined = true;
      client.player = player;

      const sheet = this.playerSheets.get(player.user_id) || createEmptySheet();
      this.playerSheets.set(player.user_id, sheet);
      this.sendToPlayer(player, EVENTS.SERVER.PLAYER_SHEET, { marks: sheet });

      if (isReconnect) {
        console.log(player.username + " reconnected to the game room: ", this.roomId);

        const pending = this.playerPendingEvents.get(player.user_id);
        if (pending) {
            client.send(pending.type, pending.data);
        }

        // Replay game log history for reconnected player, merging public and private logs
        const publicLogs = this.gameLog.getAll();
        const privateLogs = this.gameLog.getPrivateFor(player.user_id);

        // Merge and sort by turn then timestamp to preserve chronological order
        const merged = [...publicLogs.map(l => ({ ...l, _private: false })), ...privateLogs.map(l => ({ ...l, _private: true }))];
        merged.sort((a, b) => {
          if (a.turn !== b.turn) return (a.turn || 0) - (b.turn || 0);
          return (a.timestamp || 0) - (b.timestamp || 0);
        });

        for (const log of merged) {
          client.send(EVENTS.SERVER.GAME_LOG, log);
        }

        this.broadcastPlayerList();
      } else {
        console.log(player.username + " joined the game room: ", this.roomId);
        this.gameLog.playerJoined(user);
      }

      if (this.clients.length === this.state.players.size) {
        this.startGame();
      }      
  }

  async onLeave(client) {
    let player = this.state.getPlayer(client.player.user_id);
    if (player) {
      player.connected = false;
      console.log(player.username + " disconnected from game room: " + this.roomId);      
    }
    //this.state.removePlayer(client.player.user_id);  //TODO HANDLE DISCONNECTS WITH REJOINS
    client.send(EVENTS.GAME_LOBBY.DISCONNECT);
  }

  getClientByPlayerId(playerId) {
    return this.clients.find(client => String(client.player?.user_id) === String(playerId));
  }

  findPlayerByCharacterId(characterId) {
    return Array.from(this.state.players.values()).find(player =>Number(player.character_id) === Number(characterId));
  }

  findCharacterByCharacterId(characterId) { 
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

  queuePrivateEvent(player, event, data) {
      this.playerPendingEvents.set(player.user_id, {type: event, data });
      this.sendToPlayer(player, event, data);
  }  

  getPlayerCard(player, cardId, cardType) {
    return player.hand.find(card =>
      String(card.id) === String(cardId) &&
      card.type === cardType
    );
  }

  toCardSchema(cardData) {
    return new Card(
      cardData.name,
      cardData.type,
      cardData.imagetag,
      cardData.id
    );
  }  

  findObjection(suggestingPlayer, suggestion) {
    const order = this.playerOrder;
    const startIndex = order.indexOf(suggestingPlayer.user_id);

    // Check players clockwise
    for (let i = 1; i < order.length; i++) {

      const playerId = order[(startIndex + i) % order.length];
      const player = this.state.players.get(playerId);

      // skip missing, eliminated, spectators, and the suggesting player
      if (!player || player.eliminated || player.isSpectator || player.user_id === suggestingPlayer.user_id) continue;

      const matchingCards = player.hand.filter(card =>
        card.name === suggestion.suspect ||
        card.name === suggestion.weapon ||
        card.name === suggestion.room
      );

      if (matchingCards.length > 0) {
        // found an objector: return immediately (do not log further players)
        return {
          player,
          objections: matchingCards
        };
      }

      // No matching cards — record a public "player passed" log for this player
      try {
        this.gameLog.playerPassed(player);
      } catch (e) {
        console.warn('Failed to log player passed for', player?.username, e);
      }
    }

    return null;
  }

  setPlayerOrder(playersMap) {
    const players = [...playersMap.values().filter(player => !player.isSpectator)];
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

    this.broadcastPlayerList();
    this.gameLog.newTurn(this.state.getPlayer(this.state.currentTurn.currentPlayerId));

    console.log("Game started. First player:", this.state.getPlayer(this.state.currentTurn.currentPlayerId).username);
  }

  broadcastPlayerList() {
    const users = this.playerOrder
      .map(playerId => this.state.players.get(playerId))
      .filter(Boolean)
      .map(player => player.username);

    this.broadcast(EVENTS.SERVER.GAME_PLAYER_LIST, { users });    
  }

  async nextTurn() {
    this.playerPendingEvents.clear();    

    const state = this.state;
    const ids = this.playerOrder;

    let currentIndex = ids.indexOf(state.currentTurn.currentPlayerId);
    let nextPlayerId = null;

    for (let i = 1; i <= ids.length; i++) {
      const candidateIndex = (currentIndex + i) % ids.length;
      const candidateId = ids[candidateIndex];
      const player = state.getPlayer(candidateId);

      if (!player?.eliminated) {
        nextPlayerId = candidateId;
        break;
      }
    }

    // ALL players are eliminated, the criminal wins.
    if (!nextPlayerId) {
      console.warn("No eligible players remain. Criminal wins. Ending game.");
      this.gameLog.criminalGotAway();
      await saveGame(Array.from(this.state.players.values()), this.gameLog.getAll());  
      const fullsolution = new Suggestion(this.solution.person.name, this.solution.weapon.name, this.solution.room.name);
      fullsolution.cards.push(this.solution.person, this.solution.weapon, this.solution.room);
      this.state.currentTurn.suggestion = fullsolution;      
      this.state.phase = PHASES.GAME_OVER;
      return;
    }

    state.currentTurn.currentPlayerId = nextPlayerId;
    this.state.turn++;
    this.gameLog.newTurn(state.getPlayer(nextPlayerId));
    this.resetTurn();
    state.phase = PHASES.TURN_START;
    console.log("Next player:", state.getPlayer(nextPlayerId).username);
  }

  resetTurn() {
    this.state.resetTurn();
  }
}
