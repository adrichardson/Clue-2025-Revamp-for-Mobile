import express from "express";
import User from "../config/schemas/User.js";

const router = express.Router();

router.get("/", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Not logged in" });
  res.json({ username: req.session.user.username, isAdmin: req.session.user.isAdmin });
});

export default router;
