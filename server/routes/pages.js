import express from "express";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

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