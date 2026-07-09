import express from "express";
import User from "../db/config/schemas/User.js";
import AdminUser from "../db/config/schemas/AdminUser.js";
import OnlineUser from "../db/config/schemas/OnlineUser.js";
import bcrypt from "bcrypt";
import { matchMaker } from "colyseus";

const router = express.Router();

router.post("/login", async (req, res) => {
  var { username, password } = req.body;

  username = username.trim();

  if (!username) {
    return res.status(400).json({ errorType: "username", error: "Username is required" });
  } else if (!password) {
    return res.status(400).json({ errorType: "password", error: "Password is required" });
  } 

  try {
    const adminuser = await AdminUser.findOne({username}); //equivalent to AdminUser.findOne({ username: username })
    const user = await User.findOne({ $or: [ { username: username }, { email: username } ] });
    const validUser = adminuser || user;

    if (!validUser) {
      return res.status(401).json({ errorType: "username", error: "Invalid username" });
    }
    
    const isMatch = await bcrypt.compare(password, validUser.password);

    if (!isMatch) {
      return res.status(401).json({ errorType: "password", error: "Invalid password" });
    }

    if(adminuser){
      // After login or logout success:
      const adminRooms = matchMaker.connections;
      for (let roomId in adminRooms) {
      const room = adminRooms[roomId].room;
          if (room.constructor.name === "AdminRoom") {
              room.pushUpdate();
          }
      }

      req.session.user = { username: adminuser.username, isAdmin: true };
      return res.json({ message: "admin login success" });
    } else if (user) {  
      req.session.user = { username: user.username, user_id: user._id, isAdmin: false };

      return res.json({ message: "user login success" });   
    }
  } catch (err) {
    return res.status(500).json({ errorType: "username", error: err.message });
  }
});

router.post("/logout", async (req, res) => {
    try {
        const sessionUser = req.session.user;

        if (sessionUser) {
            const user = await User.findOne({ username: sessionUser.username });

            if (user) {
                await OnlineUser.deleteOne({ user: user._id });
            }

            req.session.destroy(() => {});
        }

        res.json({ message: "Logged out" });
    } catch (err) {
        res.status(500).json({
            errorType: "username",
            error: err.message
        });
    }
});

export default router;
