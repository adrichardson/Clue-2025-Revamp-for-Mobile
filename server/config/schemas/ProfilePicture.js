import mongoose from "mongoose";

// 1 = ms scarlet
// 2 = mrs peacock
// 3 = mrs white
// 4 = mr green
// 5 = professor plum
// 6 = colonel mustard
const profilePictureSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageId: {
    type: Number,
    required: true,
    default: 1,
    validate: [
      { validator: Number.isInteger, message: "{VALUE} is not an integer" },
      { validator: v => v >= 1 && v <= 6, message: "{VALUE} must be between 1 and 6" }
    ]
  },
});

const ProfilePicture = mongoose.model("ProfilePicture", profilePictureSchema);

export default ProfilePicture;