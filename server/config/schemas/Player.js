import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  characterId: { type: mongoose.Schema.Types.ObjectId, ref: "Character", required: true }
});

const Player = mongoose.model("Player", playerSchema);

export default Player;
