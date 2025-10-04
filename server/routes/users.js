import express from "express";
import User from "../db/config/schemas/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "username createdAt");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;