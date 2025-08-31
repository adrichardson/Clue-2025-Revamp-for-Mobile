import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import session from "express-session";
import http from "http";
import { Server, LobbyRoom } from "colyseus";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";
import pageRoutes from "./routes/pages.js"; 
import auth from "./middleware/authMiddleware.js";

const PORT = process.env.PORT || 2567;
const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Serve static client files
app.use(express.static(path.resolve(__dirname, "..", "client")));
app.use(
  session({
    secret: "testsecretkey%&&!!@@%$%!", // change this to something secure
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // true only if using HTTPS
  })
);

app.use(express.json());
app.use("/", pageRoutes);     // /pages
app.use("/auth", authRoutes);       // /auth/register, /auth/login
app.use("/api/users", userRoutes); // /api/users
app.use("/admin", adminRoutes);    // /admin

// Colyseus game server
const gameServer = new Server({
  server,
});

// Define Lobby and ChatRoom
gameServer.define("lobby", LobbyRoom);

app.get("/", (req, res) => {
  res.redirect("/home");
});

// 404 handler should be LAST
app.use((req, res) => {
  res.status(404).sendFile(path.resolve(__dirname, "..", "client", "screens", "404.html"));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
