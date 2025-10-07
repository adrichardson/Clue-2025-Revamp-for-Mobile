import express from "express";
import auth from "../middleware/authMiddleware.js";
import { matchMaker } from "colyseus";

const router = express.Router();

router.post("/createroom", auth.requireLogin, async (req, res) => {
    const { game } = req.body;
    try {
        const room = await matchMaker.createRoom("game", game);
        res.json({ game_id: room.roomId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create room" });
    }
});

export default router;
