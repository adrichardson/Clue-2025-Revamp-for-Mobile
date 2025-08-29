import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import http from "http";
import { Server, LobbyRoom } from "colyseus";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

const PORT = process.env.PORT || 2567;
const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Serve static client files
app.use(express.static(path.resolve(__dirname, "..", "client")));

app.use(express.json());
app.use("/api", authRoutes);      // /api/register, /api/login
app.use("/api/users", userRoutes); // /api/users

// Colyseus game server
const gameServer = new Server({
  server,
});

// Define Lobby and ChatRoom
gameServer.define("lobby", LobbyRoom);

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "client", "screens", "register.html"));
});

// 404 handler should be LAST
app.use((req, res) => {
  res.status(404).sendFile(path.resolve(__dirname, "..", "client", "screens", "404.html"));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
