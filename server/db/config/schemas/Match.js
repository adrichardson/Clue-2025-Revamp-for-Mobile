import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  players: [{
    user_id: String,
    character_id: Number,
    result: String // "win" | "lose"
  }],
  createdAt: { type: Date, default: Date.now }
});

const Match = mongoose.model("Match", matchSchema);

export default Match;