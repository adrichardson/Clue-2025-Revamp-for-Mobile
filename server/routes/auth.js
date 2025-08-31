import express from "express";
import User from "../config/schemas/User.js";
import AdminUser from "../config/schemas/AdminUser.js";
import OnlineUser from "../config/schemas/OnlineUser.js";
import bcrypt from "bcrypt";
import { matchMaker } from "colyseus";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "username already taken" });
    }

    const user = new User({ username, password });
    await user.save();

    res.status(201).json({
      message: "User created",
      user: { username: user.username, createdAt: user.createdAt },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    const adminuser = await AdminUser.findOne({username});
    
    if(adminuser){
      const isMatch = await bcrypt.compare(password, adminuser.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.session.user = { username: adminuser.username, isAdmin: true };
      res.json({ message: "admin login success" });
    }
    
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Mark user online
    await OnlineUser.findOneAndUpdate(
      { user: user._id },
      { user: user._id, connectedAt: new Date() },
      { upsert: true, new: true }
    );

    // After login or logout success:
    const adminRooms = matchMaker.connections;
    for (let roomId in adminRooms) {
    const room = adminRooms[roomId].room;
        if (room.constructor.name === "AdminRoom") {
            room.pushUpdate();
        }
    }
    req.session.user = { username: user.username, isAdmin: false };
    res.json({ message: "user login success"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/logout", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      await OnlineUser.deleteOne({ user: user._id });
    }
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
