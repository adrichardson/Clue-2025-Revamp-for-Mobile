import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",   // References the User model
    required: true,
  },
  character_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Character", // References the Character model
  }
});

const Player = mongoose.model("Player", playerSchema);

export default Player;
