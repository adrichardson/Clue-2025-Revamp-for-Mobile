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

async function joinGameLobby(game_id) {
  try {
    colyseus = new ColyseusGameLobbyService();
    var user = await getUser();
    await colyseus.connect(user, game_id);
    setGameLobbyCallbacks();
  } catch (e) {
    console.error("Failed to join game lobby:", e);
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
    const gamelobby = colyseus.gamelobbyroom;
    const $ = Colyseus.getStateCallbacks(gamelobby); 
    // Listen to 'player' instance additions
    $(gamelobby.state).players.onAdd((player, sessionId) => {
        console.log('Player joined:', player);
        // Listening for any change on the player instance
        // $(player).onChange(() => {
        //     console.log('Player changed:', player);
        // });   
        $(player).listen("readystate", (readystate) => {
          if(user.username == player.username) return;
            console.log('Player readychange:', readystate);
        });
        $(player).listen("character_id", (character_id) => {         
            updateLobbyCharacters(player.username, character_id);
        });          
        if(gamelobby.metadata){
          const players = gamelobby.state.players;        
          gamelobby.metadata.currentplayers = players.size;
          console.log("setting lobby title");
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
    });
  }
}

async function setupGameLobbyHandlers() {
    if(!colyseus) {
      return;
    } else {
      const game = colyseus.gamelobbyroom;
      game.onMessage("metadata", (data) => {
        const players = game.state.players;        
        game.metadata = data;
        game.metadata.currentplayers = players.size;
        setLobbyTitle(game.metadata);        
      });

      game.onMessage("disconnected", (data) => {
        window.history.back();
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
      console.log("Joined lobby!");
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

  async creategame(game) {
    const res = await fetch("/api/gamelobby/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game })
    });
    const { game_id } = await res.json();
    game.game_id = game_id;    
    this.lobby.send("gamelobbycreated", { game });
    this.disconnect();    
    window.location.href = `/gamelobby?id=${game_id}`;    
  }

  async joingamelobby(user, game_id) {
    if(this.client){      
      this.disconnect();      
      window.location.href = `/gamelobby?id=${game_id}`; 
    }
  }  
}

class ColyseusGameLobbyService {
  constructor() {
    this.client = null;
    this.gamelobbyroom = null;
  }

  async connect(user, game_id) {
    if (!this.client) {
      this.client = new Colyseus.Client("ws://192.168.11.2:2567");
    }
    if (!this.gamelobbyroom) {
      this.gamelobbyroom = await this.client.joinById(game_id, { user });  
      setupGameLobbyHandlers();
      console.log("✅ Joined game lobby:", this.gamelobbyroom.roomId);
    }
    return this;
  }

  send(type, data) {
    if (this.gamelobbyroom) {
      this.gamelobbyroom.send(type, data);
    }
  }

  async disconnect(){

  }
}