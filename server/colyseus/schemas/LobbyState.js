import { Schema, MapSchema, defineTypes } from "@colyseus/schema";
import { User } from "./User.js";

export class LobbyState extends Schema {
  constructor() {
    super();
    this.activeusers = new MapSchema();
  }

  addUser(user) {
    this.activeusers.set(user.user_id, user);
  }

  removeUser(user_id) {
    this.activeusers.delete(user_id);
  }

  getUser(user_id) {
    return this.activeusers.get(user_id);
  }
}

defineTypes(LobbyState, {
  activeusers: { map: User }
});
