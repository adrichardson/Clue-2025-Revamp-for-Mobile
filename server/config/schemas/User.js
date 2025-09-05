import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profile_pic_id: {
    type: Number,
    required: true,
    default: 1,
    validate: [
      { validator: Number.isInteger, message: "{VALUE} is not an integer" },
      { validator: v => v >= 1 && v <= 6, message: "{VALUE} must be between 1 and 6" }
    ]
  },
  lastOnline: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);

export default User;