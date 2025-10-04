import { Schema, type, defineTypes } from "@colyseus/schema";

class User extends Schema {
  constructor(username = "", user_id = "") {
    super();
    this.username = username;
    this.user_id = user_id;
  }
}

// Define schema fields + types
defineTypes(User, {
  username: "string",
  user_id: "string",
});

export { User };

//this.state.addUser(client.sessionId, new User("Alice", "u123", "char01", false));
