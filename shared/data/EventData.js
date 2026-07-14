export const EVENTS = {
  CLIENT: {
    CHAT_MESSAGE: "client:chatMessage",
    ROLLED: "client:rolled",
    MOVED: "client:moved",
    OBJECTED: "client:objected",
    SUGGESTED: "client:suggested",
    CHOOSE_FINAL: "client:choosefinal",
    SUBMIT_FINAL: "client:submitfinal",    
    NEW_TURN: "client:newTurn"
  },

  SERVER: {
    STATE_READY: "server:stateReady",
    PHASE_CHANGED: "server:phaseChanged",
    TURN_CHANGED: "server:turnChanged",
    CHAT_MESSAGE: "server:chatMessage",
    ROLL_RESULT: "server:rollResult",
    OBJECTION_FOUND: "server:objectionFound",
    FINAL_POSSIBLE: "server:finalpossible",
    FINAL_INCORRECT: "server:finalincorrect",
    PLAYER_ADDED: "server:playerAdded",
    PLAYER_REMOVED: "server:playerRemoved",
    PLAYER_INVALID_MOVE: "server:invalidMove",
    PLAYER_VALID_MOVE: "server:validMove",
    GAME_PLAYER_LIST: "server:gamePlayerList"
  },

  MAINLOBBY: {
    PLAYER_JOINED: "lobby:playerJoined",
    PLAYER_LEFT: "lobby:playerLeft",
    WELCOME_MESSAGE: "lobby:welcomeMessage",
    GAMELOBBY_CREATED: "lobby:gamelobbyCreated",    
    LIST_GAMES: "lobby:listgames",
    ONLINE_USERS: "lobby:onlineusers",
    REFRESH_GAMES: "lobby:refreshgames", 
    LOGOUT: "lobby:logout"  
  },

  GAME_LOBBY: {
    METADATA_CHANGE: "gamelobby:metadatachanged",
    DISCONNECT: "gamelobby:disconnected",
    GAME_STARTED: "gamelobby:gamestarted",
    GAME_STARTING: "gamelobby:gamestarting",
    GAME_START_CANCELLED: "gamelobby:gamestartcancelled",
    START_GAME_REQUEST: "gamelobby:startGameRequest",
    OWNER_CHANGE: "gamelobby:ownerchange",    
    PLAYER_JOINED: "gamelobby:playerJoined",
    PLAYER_LEFT: "gamelobby:playerLeft",
    READYSTATE_CHANGE: "gamelobby:readystateChange",    
    CHARACTER_CHANGE: "gamelobby:characterChange"
  },

  CHAT_MESSAGE: {
    PLAYER_CHAT: "chat:playerMessage",
    SERVER_MESSAGE: "chat:serverMessage"
  }  
};