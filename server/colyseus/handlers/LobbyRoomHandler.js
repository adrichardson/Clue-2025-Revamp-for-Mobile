import { Game } from "../schemas/Game.js";

export const lobbyroomHandlers = {
  newGameCreated: (room, client, message) => {
    const user = client.user;
    if (user) {
        const { username, type, mode, maxplayers, game_id } = message.game;

        console.log(username + " created a new game with id " + game_id);
        let newgame = new Game(username, type, mode, maxplayers, game_id);
        room.state.addGame(newgame);

        room.broadcast("gameCreated", { games : room.state.activegames }, { except: client });        
    }
  },
  listGames: (room, client) => {
    const user = client.user;
    if (user) {
      client.send("gamelist", {games : room.state.activegames});
    }
  }
};