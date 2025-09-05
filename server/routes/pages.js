import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/register", (req, res) => {
  const step = req.query.step || 1;
  res.render("registration", { step, email: req.session.email || "" });  
});

app.post("/registration/step1", (req, res) => {
  req.session.email = req.body.email;   // save to session
  res.redirect("/registration?step=2"); // go to step 2
});

router.get("/login", auth.redirectIfLoggedIn, (req, res) => {
   res.render("login");
});

router.get("/home", auth.requireLogin, (req, res) => {
  res.render("homescreen");
});

export default router;