import mongoose from "mongoose";

const characterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },  // path or URL to image
  color: { type: String, required: true },  // hex color, e.g. "#ff5733"
  createdAt: { type: Date, default: Date.now }
});

const Character = mongoose.model("Character", characterSchema);

export default Character;
