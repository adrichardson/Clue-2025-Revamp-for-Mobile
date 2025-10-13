// rooms/LobbyRoom.js
import { Room } from "colyseus";
import { LobbyState } from "../schemas/LobbyState.js";
import { User } from "../schemas/User.js";
import { LobbyRoomHandlers } from "../handlers/LobbyRoomHandler.js";

export class LobbyRoom extends Room {
  onCreate(options) {
    this.autoDispose = false; // keep lobby alive
    this.state = new LobbyState();

    global.lobbyRoom = this; 

    for (const [msg, handler] of Object.entries(LobbyRoomHandlers)) {
      this.onMessage(msg, (client, message) => {
        handler(this, client, message);
      });
    }    

    console.log("LobbyRoom ("+ this.roomId +") created!");
  }

  onJoin(client, options) {
    const username = options.username;
    const user_id = options.user_id;

    let existingUser = this.state.getUser(user_id);

    if (existingUser) {
      client.user = existingUser;
      console.log(existingUser.username, "rejoined the lobby!");
      // notify others
      this.broadcast("userJoined", { username }, { except: client });
      client.send("welcome", { message: `Welcome ${username}!` });      
      return;
    }
    
    let user = new User(username, user_id);
    this.state.addUser(user);
    client.user = user;

    console.log(user.username, "joined the lobby!");
    // notify others
    this.broadcast("userJoined", { username }, { except: client });
    client.send("welcome", { message: `Welcome ${username}!` });    
  }

  onLeave(client) {
    const user = client.user;
    const username = user.username;
    const user_id = user.user_id;

    if (user) {
      console.log(username, "has left the main lobby");
      this.state.removeUser(user_id);
      this.broadcast("userLeft", { username }, { except: client });
    }
  }
}
