import express from "express";
import User from "../config/schemas/User.js";
import ProfilePictures from "../config/schemas/ProfilePicture.js";
import { profile } from "console";

const router = express.Router();

router.get("/", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Not logged in" });
  res.json({ username: req.session.user.username, isAdmin: req.session.user.isAdmin });
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
