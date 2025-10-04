import express from "express";
import User from "../db/config/schemas/User.js";
import ProfilePictures from "../db/config/schemas/ProfilePicture.js";

const router = express.Router();

router.get("/", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Not logged in" });
  res.json({ user: req.session.user });
});

router.get("/profileImageId", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Not logged in" });
  const username = req.session.user.username;
  const user = await User.findOne({username});
  const userId = user._id;
  const pic = await ProfilePictures.findOne({userId});

  res.json({ imageId: pic.imageId});
});

export default router;
