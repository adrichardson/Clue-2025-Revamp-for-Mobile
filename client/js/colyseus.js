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

  } catch (e) {  
    console.error("Failed to join game lobby:", e);
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
        console.log("gamecreated message:", message);
        listGames(message);        
      });      

      lobby.onMessage("listgames", (message) => {
        console.log("listgames message:", message);
        listGames(message);
      });            

      lobby.onMessage("logout", (message) => {
        console.log("logout message:", message);
      });           
    }
}

async function setupGameHandlers() {
    if(!colyseus) {
      return;
    } else {
      const game = colyseus.gameroom;
      game.onMessage("userJoined", (message) => {
        console.log("userJoined (gameroom) message:", message);
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
      this.lobby = await this.client.joinOrCreate("lobby", { username: user.username, user_id: user.user_id });       
      setupLobbyHandlers();
      console.log("Joined lobby!", this.lobby.roomId);  
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

  async createnewgame(game, user) {
    const res = await fetch("/api/game/createroom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game, user })
    });
    const { game_id } = await res.json();
    game.game_id = game_id;    
    this.lobby.send("gamecreated", { game });
    this.disconnect();    
    window.location.href = `/game?id=${game_id}`;    
  }

  async joingamelobby(user, game_id) {
    if(this.client){      
      this.gameroom = await this.client.joinById(game_id, { user });
      this.disconnect();      
      window.location.href = `/game?id=${game_id}`; 
      console.log("Joined game room lobby: ", game_id);      
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
      this.gameroom = await this.client.joinById(game_id, {user});
      setupGameHandlers();      
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