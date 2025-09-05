import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/register", (req, res) => {
  const step = req.query.step || 1;
  res.render("register", { step });  
});

router.get("/login", auth.redirectIfLoggedIn, (req, res) => {
   res.render("login");
});

router.get("/home", auth.requireLogin, (req, res) => {
  res.render("homescreen");
});

export default router;