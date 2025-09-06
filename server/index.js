import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import session from "express-session";
import http from "http";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import userRoute from "./routes/user.js"
import adminRoutes from "./routes/admin.js";
import pageRoutes from "./routes/pages.js"; 
import registraionRoutes from "./routes/registraion.js";

import { Server, matchMaker } from "colyseus";
import { LobbyRoom } from "./rooms/LobbyRoom.js";
import { AdminRoom } from "./rooms/AdminRoom.js";
import { GameRoom } from "./rooms/GameRoom.js";

const PORT = process.env.PORT || 2567;
const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", [
  path.resolve(__dirname, "..", "client", "views"),
  path.resolve(__dirname, "..", "client", "admin"),
]);
// Serve static client files
app.use(express.static(path.resolve(__dirname, "..", "client")));

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(
  session({
    secret: "testsecretkey%&&!!@@%$%!", // change this to something secure
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // true only if using HTTPS
  })
);

app.use(express.json());
app.use("/", pageRoutes);                 // /pages
app.use("/auth", authRoutes);             // /auth/register, /auth/login
app.use("/api/users", userRoutes);        // /api/users
app.use("/api/user", userRoute);          // /api/user
app.use("/admin", adminRoutes);           // /admin
app.use("/register", registraionRoutes);  // /register

// Colyseus game server
const gameServer = new Server({
  server,
});

// Define Lobby and GameRoom
gameServer.define("lobby", LobbyRoom);
gameServer.define("admin", AdminRoom);
gameServer.define("game", GameRoom);

//Force create a persistent lobby on startup
(async () => {
  try {
    await matchMaker.create("lobby", { persistent: true });
    console.log("✅ Persistent Lobby created and running");
  } catch (err) {
    console.error("❌ Failed to create persistent lobby:", err);
  }
})();

app.get("/", (req, res) => {
  res.status(404).sendFile(path.resolve(__dirname, "..", "client", "index.html"));
});

// 404 handler should be LAST
app.use((req, res) => {
  res.status(404).sendFile(path.resolve(__dirname, "..", "client", "views", "404.html"));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
