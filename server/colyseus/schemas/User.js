import { Schema, type, defineTypes } from "@colyseus/schema";

class User extends Schema {
  constructor(username = "", user_id = "") {
    super();
    this.username = username;
    this.user_id = user_id;
  }
}

defineTypes(User, {
  username: "string",
  user_id: "string",
});

export { User };