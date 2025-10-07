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
    colyseus = new ColyseusGameService();
    var user = await getUser();
    await colyseus.connect(user, game_id);  
    setupGameHandlers();
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

      lobby.onMessage("gamecreated", (message) => {
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

function setMetadata(game) {
    const players = game.state.players;        
    game.metadata = data;
    game.metadata.currentplayers = players.size;
    setLobbyTitle(data);    
}

async function setupGameHandlers() {
    if(!colyseus) {
      return;
    } else {
      const game = colyseus.gameroom;
      const $ = Colyseus.getStateCallbacks(game);
      // Listen to 'player' instance additions
      $(game.state).players.onAdd((player, sessionId) => {
          console.log('Player joined:', player);
          // Listening for any change on the player instance
          // $(player).onChange(() => {
          //     console.log('Player changed:', player);
          // });   
          $(player).listen("readystate", (readystate) => {
              console.log('Player readychange:', readystate);
          });
          $(player).listen("character_id", (character_id) => {
              console.log(`${player.username} has chosen ${character_id}`);
              updateLobbyCharacters(player.username, character_id);
          });          
          if(game.metadata){
            const players = game.state.players;        
            game.metadata.currentplayers = players.size;            
            setLobbyTitle(game.metadata);    
          }
      });      
      $(game.state).players.onRemove((player, sessionId) => {
          console.log('Player left:', player);
          if(game.metadata){
            const players = game.state.players;        
            game.metadata.currentplayers = players.size;            
            setLobbyTitle(game.metadata);    
          }          
      });

      game.onMessage("metadata", (data) => {
        const players = game.state.players;        
        game.metadata = data;
        game.metadata.currentplayers = players.size;
        setLobbyTitle(game.metadata);        
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
    const res = await fetch("/api/game/createroom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game })
    });
    const { game_id } = await res.json();
    game.game_id = game_id;    
    this.lobby.send("gamecreated", { game });
    this.disconnect();    
    window.location.href = `/game?id=${game_id}`;    
  }

  async joingamelobby(user, game_id) {
    if(this.client){      
      this.disconnect();      
      window.location.href = `/game?id=${game_id}`; 
    }
  }  
}

class ColyseusGameService {
  constructor() {
    this.client = null;
    this.gameroom = null;
  }

  async connect(user, game_id) {
    if (!this.client) {
      this.client = new Colyseus.Client("ws://192.168.11.2:2567");
    }
    if (!this.gameroom) {
      this.gameroom = await this.client.joinById(game_id, { user });  
      console.log("Joined lobby!", this.gameroom.roomId);  
    }
    return this;
  }

  send(type, data) {
    if (this.gameroom) {
      this.gameroom.send(type, data);
    }
  }

  async disconnect(){

  }
}