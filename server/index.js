import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import http from "http";
import { Server, LobbyRoom } from "colyseus";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";

const PORT = process.env.PORT || 2567;
const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB(); // <-- Call this before starting the server

// Serve static client files
app.use(express.static(path.resolve(__dirname, "..", "client")));

app.use(express.json()); // <-- Place this near the top, after static

// Colyseus game server
const gameServer = new Server({
  server,
});

// Define Lobby and ChatRoom
gameServer.define("lobby", LobbyRoom); // built-in lobby

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "client", "screens", "register.html"));
});

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "User created", user: { username: user.username, createdAt: user.createdAt } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "username createdAt"); // Only return username and createdAt
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      res.json({ message: "Welcome" });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404 handler should be LAST
app.use((req, res) => {
  res.status(404).sendFile(path.resolve(__dirname, "..", "client", "screens", "404.html"));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
