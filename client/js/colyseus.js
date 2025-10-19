let colyseus = null;

async function joinMainLobby() {
  try {
    colyseus = new ColyseusLobbyService();
    var user = await getUser();
    await colyseus.connect(user);
    getAvailableGames();

  } catch (e) {  
    console.error("Failed to join lobby:", e);
  }
}

async function joinGameLobby(gamelobby_id) {
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

async function joinGame(game_id) {
  try {
    colyseus = new ColyseusGameService();
    var user = await getUser();
    await colyseus.connect(user, game_id);
    setGameCallbacks();
  } catch (e) {
    console.error("Failed to join game:", e);
    //TODO: add popup with confirm stating lobby has shutdown
    window.history.back();
  }
}

async function setupLobbyHandlers() {
    if(!colyseus) {
      return;
    } else {
      const lobby = colyseus.lobby;
      lobby.onMessage("userJoined", (message) => {
        console.log("userJoined message:", message);
      });

      lobby.onMessage("userLeft", (message) => {
        console.log("userLeft message:", message);
      });
      
      lobby.onMessage("welcome", (message) => {
        console.log("welcome message:", message);
      });

      lobby.onMessage("gamelobbycreated", (message) => {
        console.log("gamelobbycreated message:", message);
        listGames(message);        
      });      

      lobby.onMessage("listgames", (message) => {
        listGames(message);
      });            

      lobby.onMessage("logout", (message) => {
        console.log("logout message:", message);
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
    // Listen to 'player' instance additions
    $(gamelobby.state).players.onAdd((player, sessionId) => {
        $(player).listen("readystate", (readystate, previousValue) => {
            if (previousValue === undefined) return;
            newservermessage("toggleready", player);
        });     
        $(player).listen("character_id", (character_id, previousValue) => {  
            if (previousValue === undefined) {
              updateLobbyCharacters(player, character_id);
              return;            
            }
            newservermessage("character_id", player);
            updateLobbyCharacters(player, character_id);
        });          
        if(gamelobby.metadata){
          const players = gamelobby.state.players;        
          gamelobby.metadata.currentplayers = players.size;
          setLobbyTitle(gamelobby.metadata);
        }
    });      
    $(gamelobby.state).players.onRemove((player, sessionId) => {
        if(user.username == player.username) return;        
        console.log('Player left:', player);
        clearUserCharacter(player.username);       
        if(gamelobby.metadata){
          const players = gamelobby.state.players;        
          gamelobby.metadata.currentplayers = players.size;            
          setLobbyTitle(gamelobby.metadata);    
        }
        newservermessage("playerleft", player);        
    });
  }
}

async function setupGameLobbyHandlers() {
    if(!colyseus) {
      return;
    } else {
      const gamelobby = colyseus.gamelobby;
      gamelobby.onMessage("metadata", (data) => {
        const players = gamelobby.state.players;        
        gamelobby.metadata = data;
        gamelobby.metadata.currentplayers = players.size;
        setLobbyTitle(gamelobby.metadata);        
      });

      gamelobby.onMessage("disconnected", (data) => {
        window.history.back();
      });

      gamelobby.onMessage("chatmessage", (data) => {
        var { message, player } = data;
        newchatmessage(message, player);
      });

      gamelobby.onMessage("playerjoined", (data) => {
        var { player } = data;
        newservermessage("playerjoined", player);
      });         
    }
}

async function setGameCallbacks(){
    if(!colyseus) {
    return;
  } else {
    const game = colyseus.game;
    const $ = Colyseus.getStateCallbacks(game); 
    // Listen to 'player' instance additions
    $(game.state).players.onAdd((player, sessionId) => {        
        if(game.metadata){
          const players = game.state.players;        
          game.metadata.currentplayers = players.size;
        }
    }); 
  }
}

async function setupGameHandlers() {
    if(!colyseus) {
      return;
    } else {
      const game = colyseus.game;
      game.onMessage("metadata", (data) => {
        const players = game.state.players;
        game.metadata = data;
        game.metadata.currentplayers = players.size;
      });
 
      game.onMessage("chatmessage", (data) => {
        var { message, player } = data;
        newchatmessage(message, player);
      });        
    }
}

class ColyseusLobbyService {
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
      setupLobbyHandlers();
    }
    return this;
  }

  async disconnect(){
    if (this.lobby) {
      try {
        await this.lobby.leave();
        console.log("Left main lobby.");
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

  async creategamelobby(gamelobbydata) {
    const res = await fetch("/api/gamelobby/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gamelobbydata })
    });
    const { gamelobby_id } = await res.json();
    gamelobbydata.gamelobby_id = gamelobby_id;
    console.log("Created game lobby with ID:", gamelobby_id);
    this.lobby.send("gamelobbycreated", { gamelobbydata });
    this.disconnect();
    window.location.href = `/gamelobby?id=${gamelobby_id}`;
  }

  async joingamelobby(user, gamelobby_id) {
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