import mongoose from "mongoose";

const onlineUserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  room: {
    type: String,
    default: null, // optional: track which room they are in
  },
  connectedAt: {
    type: Date,
    default: Date.now,
  }
});

// Optionally prevent duplicate entries for the same user
onlineUserSchema.index({ user: 1 }, { unique: true });

const OnlineUser = mongoose.model("OnlineUser", onlineUserSchema);

export default OnlineUser;
