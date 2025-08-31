import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/register", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "..", "client", "screens", "register.html"));
});

router.get("/login", auth.redirectIfLoggedIn, (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "..", "client", "screens", "login.html"));
});

router.get("/home", auth.requireLogin, auth.redirectIfLoggedIn, (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "..", "client", "screens", "homescreen.html"));
});

export default router;