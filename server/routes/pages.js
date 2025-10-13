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

router.get("/gamelobby", auth.requireLogin, (req, res) => {
  const game_id = req.query.id;  
  res.render("gamelobby", { game_id });
});

const allowedPartials = ["homearea", "gamearea", "banner"];
router.get("/partials/:view", (req, res) => {
  const view = req.params.view;
  if (!allowedPartials.includes(view)) return res.status(404).send("Not allowed");
  res.render(view);
});

export default router;