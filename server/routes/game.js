import express from "express";
import { matchMaker } from "colyseus";

const router = express.Router();

router.post("/createroom", async (req, res) => {
    const { game, user } = req.body;
    try {
        const room = await matchMaker.createRoom("game", { game, user });
        res.json({ game_id: room.roomId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create room" });
    }
});

export default router;
