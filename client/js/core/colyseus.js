import { getUser } from "./utils/user.js";
import { emit } from "../core/handlers/colyseusCallbacks.js";
import { EVENTS, SCHEMA_FIELDS } from "../../../shared/data/index.js";

let colyseus = null;

export async function joinMainLobby() {
  try {
    colyseus = new ColyseusMainLobbyService();
    var user = await getUser();
    await colyseus.connect(user);
    getAvailableGames();
  } catch (e) {  
    console.error("Failed to join lobby:", e);
  }
}

export async function joinGameLobby(gamelobby_id) {
  try {
    colyseus = new ColyseusGameLobbyService();
    var user = await getUser();
    await colyseus.connect(user, gamelobby_id);
    setGameLobbyCallbacks();
  } catch (e) {
    console.error("Failed to join game lobby:", e);
    //TODO: add popup with confirm stating lobby has shutdown
    window.history.back();
  }
}

export async function joinGame(game_id) {
  try {
    colyseus = new ColyseusGameService();
    var user = await getUser();
    await colyseus.connect(user, game_id);
    setGameCallbacks();
  } catch (e) {
    alert(e);
    console.error("Failed to join game:", e);
    //TODO: add popup with confirm stating lobby has shutdown
    window.history.back();
  }
}

async function setupMainLobbyHandlers() {
    if(!colyseus) {
      return;
    } else {

      const lobby = colyseus.lobby;       

      lobby.onMessage(EVENTS.MAINLOBBY.PLAYER_LEFT, (message) => {
        emit(EVENTS.MAINLOBBY.PLAYER_LEFT, message);
      });
      
      lobby.onMessage(EVENTS.SERVER.CHAT_MESSAGE, (data) => {
        emit(EVENTS.SERVER.CHAT_MESSAGE, data);
      });      

      lobby.onMessage(EVENTS.MAINLOBBY.GAMELOBBY_CREATED, (message) => {
        emit(EVENTS.MAINLOBBY.GAMELOBBY_CREATED, message);
      });      

      lobby.onMessage(EVENTS.MAINLOBBY.LIST_GAMES, (message) => {
        emit(EVENTS.MAINLOBBY.LIST_GAMES, message);
      });

      lobby.onMessage(EVENTS.MAINLOBBY.ONLINE_USERS, (data) => {
        emit(EVENTS.MAINLOBBY.ONLINE_USERS, data);
      });      

      lobby.onMessage(EVENTS.MAINLOBBY.REFRESH_GAMES, (message) => {
        emit(EVENTS.MAINLOBBY.REFRESH_GAMES, message, colyseus);
      });      

      lobby.onMessage(EVENTS.MAINLOBBY.LOGOUT, (message) => {  
        emit(EVENTS.MAINLOBBY.LOGOUT, message);
      });           
    }
}

async function setGameLobbyCallbacks(){
    if(!colyseus) {
    return;
  } else {

    const user = await getUser();      
    const gamelobby = colyseus.gamelobby;
    const $ = Colyseus.getStateCallbacks(gamelobby);

    $(gamelobby.state).listen(SCHEMA_FIELDS.GAME_LOBBY.PLAYERS_READY, (readystate, previousReadyState) => {
      emit(EVENTS.GAME_LOBBY.PLAYERS_READY, readystate, previousReadyState);
    });    
    // Listen to 'player' instance additions
    $(gamelobby.state).players.onAdd((player, sessionId) => {

        $(player).listen(SCHEMA_FIELDS.PLAYER.READYSTATE, (readystate, previousReadyState) => {
            emit(EVENTS.GAME_LOBBY.READYSTATE_CHANGE, readystate, previousReadyState, player);
        });

        $(player).listen(SCHEMA_FIELDS.PLAYER.CHARACTER_ID, (character_id, previousCharacterId) => {  
            emit(EVENTS.GAME_LOBBY.CHARACTER_CHANGE, character_id, previousCharacterId, player);
        });  
    });

    $(gamelobby.state).players.onRemove((player, sessionId) => {
        emit(EVENTS.GAME_LOBBY.PLAYER_LEFT, player, user, gamelobby);          
    });
  }
}

//lobby room
async function setupGameLobbyHandlers() {
    if(!colyseus) {
      return;
    } else {

      const gamelobby = colyseus.gamelobby;

      gamelobby.onMessage(EVENTS.GAME_LOBBY.METADATA_CHANGE, (data) => {
        emit(EVENTS.GAME_LOBBY.METADATA_CHANGE, data, gamelobby);
      });

      gamelobby.onMessage(EVENTS.SERVER.GAME_LOG, (data) => {
        emit(EVENTS.SERVER.GAME_LOG, data);
      });      

      gamelobby.onMessage(EVENTS.GAME_LOBBY.DISCONNECT, (data) => {
        emit(EVENTS.GAME_LOBBY.DISCONNECT, data);
      });

      gamelobby.onMessage(EVENTS.SERVER.CHAT_MESSAGE, (data) => {
        emit(EVENTS.SERVER.CHAT_MESSAGE, data);
      });

      gamelobby.onMessage(EVENTS.GAME_LOBBY.GAME_STARTING, (data) => {
        emit(EVENTS.GAME_LOBBY.GAME_STARTING, data);
      });

      gamelobby.onMessage(EVENTS.GAME_LOBBY.GAME_START_CANCELLED, () => {
        emit(EVENTS.GAME_LOBBY.GAME_START_CANCELLED);
      });

      gamelobby.onMessage(EVENTS.GAME_LOBBY.GAME_STARTED, ({ game_id }) => {
        emit(EVENTS.GAME_LOBBY.GAME_STARTED, colyseus, game_id); 
      }); 

      gamelobby.onMessage(EVENTS.GAME_LOBBY.OWNER_CHANGE, (data) => {
        emit(EVENTS.GAME_LOBBY.OWNER_CHANGE, data, gamelobby);
      });         
    }
}

async function setGameCallbacks() {
  if (!colyseus) return;

  const game = colyseus.game;
  const user = await getUser();

  game.onStateChange.once((state) => {

    const $ = Colyseus.getStateCallbacks(game);
    
    //initial state sync
    emit(EVENTS.SERVER.STATE_READY, state);    

    //turn change
    $(state).listen(SCHEMA_FIELDS.GAME.TURN, (turn, previousTurn) => {
      emit(EVENTS.SERVER.TURN_CHANGED, turn, previousTurn, state);
    });

    //phase change
    $(state).listen(SCHEMA_FIELDS.GAME.PHASE, (phase, previousPhase) => {
      emit(EVENTS.SERVER.PHASE_CHANGED, phase, previousPhase, state);
    });

    state.players.forEach((player, sessionId) => {

      if (user.username === player.username) {        
        renderHand(player.hand);
      }

    });

    $(state).players.onAdd((player, id) => {
      emit(EVENTS.SERVER.PLAYER_ADDED, state, player);
    });

    $(state).players.onRemove((player, id) => {
      emit(EVENTS.SERVER.PLAYER_REMOVED, state, player);    
    });
        
  });
}

function renderHand(hand) {
  const container = document.getElementById("gamehandContainer");

  const categories = ["people", "weapons", "rooms"];

  container.innerHTML = categories.map(category => {
    const cards = hand.filter(c => c.type === category);
    if (!cards.length) return "";

    return `
      <div class="cardSection">
        <div class="cardSectionHeader">
          ${category.charAt(0).toUpperCase() + category.slice(1)}
        </div>
        <div class="cardHolder">
          ${cards.map(card => `
            <div class="card">
              <img src="../assets/imgs/${card.type}/${card.imagetag}.png" class="cardimage">
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");
}

async function setupGameHandlers() {
    if(!colyseus) {
      return;
    } else {
      const game = colyseus.game;
      const user = await getUser();
      
      game.onMessage(EVENTS.SERVER.GAME_LOG, (data) => {
        emit(EVENTS.SERVER.GAME_LOG, data);
      });            
 
      game.onMessage(EVENTS.SERVER.CHAT_MESSAGE, (data) => {
        emit(EVENTS.SERVER.CHAT_MESSAGE, data);
      });        

      game.onMessage(EVENTS.SERVER.ROLL_RESULT, (data) => {
        emit(EVENTS.SERVER.ROLL_RESULT, data);
      });

      game.onMessage(EVENTS.SERVER.PLAYER_INVALID_MOVE, (data) => {
        emit(EVENTS.SERVER.PLAYER_INVALID_MOVE, data);
      }); 

      game.onMessage(EVENTS.SERVER.PLAYER_VALID_MOVE, (data) => {
        emit(EVENTS.SERVER.PLAYER_VALID_MOVE, data);
      });

      game.onMessage(EVENTS.SERVER.OBJECTION_FOUND , (data) => {
        emit(EVENTS.SERVER.OBJECTION_FOUND, data);
      });

      game.onMessage(EVENTS.SERVER.OBJECTION_SHOWN , (data) => {
        emit(EVENTS.SERVER.OBJECTION_SHOWN, data);
      });

      game.onMessage(EVENTS.SERVER.PLAYER_SHEET, (data) => {
        emit(EVENTS.SERVER.PLAYER_SHEET, data);
      });

      game.onMessage(EVENTS.SERVER.GAME_PLAYER_LIST, (data) => {
        emit(EVENTS.SERVER.GAME_PLAYER_LIST, data);
      });      
    }
}

class ColyseusMainLobbyService {
  constructor() {
    this.client = null;
    this.lobby = null;
  }

  async connect(user) {
    if (!this.client) {
      this.client = new Colyseus.Client("ws://192.168.11.2:2567");
    }
    if (!this.lobby) {
      this.lobby = await this.client.join("lobby", { username: user.username, user_id: user.user_id });       
      setupMainLobbyHandlers();
    }
    return this;
  }

  async disconnect(){
    if (this.lobby) {
      try {
        await this.lobby.leave();
      } catch (err) {
        console.error("Error leaving lobby:", err);
      } finally {
        this.lobby = null;
      }
    }    
  }

  send(type, data) {
    if (this.lobby) {
      this.lobby.send(type, data);
    }
  }

  async createlobby(gamelobbydata) {
    const res = await fetch("/api/gamelobby/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gamelobbydata })
    });

    const { gamelobby_id } = await res.json();
    gamelobbydata.gamelobby_id = gamelobby_id;

    this.lobby.send(EVENTS.MAINLOBBY.GAMELOBBY_CREATED, { gamelobbydata });
    this.disconnect();
    window.location.href = `/gamelobby?id=${gamelobby_id}`;
  }

  async joinlobby(user, gamelobby_id) {
    console.log("joining game lobby");
    if(this.client){      
      this.disconnect();      
      window.location.href = `/gamelobby?id=${gamelobby_id}`; 
    }
  }  
}

class ColyseusGameLobbyService {
  constructor() {
    this.client = null;
    this.gamelobby = null;
  }

  async connect(user, gamelobby_id) {
    if (!this.client) {
      this.client = new Colyseus.Client("ws://192.168.11.2:2567");
    }
    if (!this.gamelobby) {
      this.gamelobby = await this.client.joinById(gamelobby_id, { user });
      setupGameLobbyHandlers();
      console.log("✅ Joined game lobby:", this.gamelobby.roomId);
    }
    return this;
  }

  send(type, data) {
    if (this.gamelobby) {
      this.gamelobby.send(type, data);
    }
  }

  async creategame(players) {
    const res = await fetch("/api/game/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players })
    });
    const { game_id } = await res.json();
    this.disconnect();
    window.location.href = `/game?id=${game_id}`;
  }

  async disconnect(){
  }
}

class ColyseusGameService {
  constructor() {
    this.client = null;
    this.game = null;
  }
  
  async connect(user, game_id) {
    if (!this.client) {
      this.client = new Colyseus.Client("ws://192.168.11.2:2567");
    }
    if (!this.game) {
      this.game = await this.client.joinById(game_id, { user });
      setupGameHandlers();
      console.log("✅ Joined game:", this.game.roomId);
    }
    return this;
  }

  send(type, data) {
    if (this.game) {
      this.game.send(type, data);
    }
  }

  async disconnect(){
  }
}

export async function getAvailableGames() { 
    if(!colyseus) return;

    colyseus.send(EVENTS.MAINLOBBY.LIST_GAMES);
}

export { colyseus };