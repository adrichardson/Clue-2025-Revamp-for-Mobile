import express from "express";
import bcrypt from "bcrypt";
import User from "../config/schemas/User.js";

const router = express.Router();

router.post("/step1", (req, res) => {
  req.session.email = req.body.email; 
  res.redirect("/register?step=2"); 
});

router.post("/step2", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send("Passwords don't match!");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  req.session.username = req.body.username;
  req.session.password = hashedPassword;
  res.redirect("/register?step=3");

});

router.post("/step3", async (req, res) => {
  const email = req.session.email; // retrieve from session
  const username = req.session.username; // retrieve from session
  const password = req.session.password; // retrieve from session 

  if (password !== confirmPassword) {
    return res.send("Passwords don't match!");
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "username already taken" });
    }

    const user = new User({ username, password });
    await user.save();

    res.status(201).json({
      message: "User created",
      user: { username: user.username, createdAt: user.createdAt },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }

  // Clear session if you want
  req.session.destroy(() => {
    res.redirect("/home");
  });  
});

export default router;