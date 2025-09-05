import express from "express";
import bcrypt from "bcrypt";
import User from "../config/schemas/User.js";

const router = express.Router();

// STEP 1: Save email to session
router.post("/step1", async (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    // Ensure email is unique
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already taken" });
    } 
  } catch (err) {
    res.status(400).json({ error: err.message });
  }  
  req.session.email = req.body.email;
  res.json({ success: true, nextStep: 2 });
});

// STEP 2: Save username + hashed password
router.post("/step2", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords don't match" });
  }

  try {
    // Ensure username is unique
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    } 
  } catch (err) {
    res.status(400).json({ error: err.message });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  req.session.username = username;
  req.session.password = hashedPassword;

  res.json({ success: true, nextStep: 3 });
});

// STEP 3: Finalize user creation
router.post("/step3", async (req, res) => {
  const email = req.session.email;
  const username = req.session.username;
  const password = req.session.password;
  const { profile_pic_id } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: "Session data missing" });
  }

  try {
    // Ensure username is unique
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Save user
    const user = new User({ username, password, email, profile_pic_id });
    await user.save();

    // Clear session after registration
    req.session.destroy(() => {
      console.log("Registration session cleared");
    });

    res.status(201).json({
      success: true,
      message: "User created",
      redirect: "/home", // let frontend handle final redirect
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
