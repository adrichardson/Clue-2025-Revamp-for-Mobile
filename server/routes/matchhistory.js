import express from "express";
import Match from "../db/config/schemas/Match.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const user_id = req.session.user?.user_id;

  if (!user_id) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const matches = await Match.find({"players.user_id": user_id});

    const playerMatches = matches.map(match => ({
      _id: match._id,
      playedAt: match.playedAt,
      player: match.players.find(
        p => String(p.user_id) === String(user_id)
      ),
      createdAt: match.createdAt
    }));

    res.json(playerMatches);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;