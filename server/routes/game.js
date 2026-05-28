// export default router;
import express from "express";
import auth from "../middleware/authMiddleware.js";
import { createGame } from "../services/gameService.js";

const router = express.Router();

router.post("/create", auth.requireLogin, async (req, res) => {
  const { game } = req.body;

  try {
    const result = await createGame(game);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create room" });
  }
});

export default router;