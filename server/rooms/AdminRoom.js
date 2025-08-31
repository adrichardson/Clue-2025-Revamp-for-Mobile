import { Room } from "colyseus";
import User from "../config/schemas/User.js";
import OnlineUser from "../config/schemas/OnlineUser.js";

export class AdminRoom extends Room {
  onCreate() {
    console.log("AdminRoom created");
  }

  async onJoin(client) {
    console.log("Admin client connected:", client.sessionId);

    // send initial list
    await this.pushUpdate();
  }

  onLeave(client) {
    console.log("Admin client disconnected:", client.sessionId);
  }

  // Utility: fetch and broadcast online/offline users
  async pushUpdate() {
    const users = await User.find({}, "username createdAt").lean();
    const onlineUsers = await OnlineUser.find({}, "user").lean();
    const onlineSet = new Set(onlineUsers.map(ou => ou.user.toString()));

    const usersWithStatus = users.map(u => ({
      username: u.username,
      createdAt: u.createdAt,
      online: onlineSet.has(u._id.toString())
    }));

    this.broadcast("userList", usersWithStatus);
  }
}
