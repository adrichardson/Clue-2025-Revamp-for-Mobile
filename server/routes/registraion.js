import express from "express";
import User from "../config/schemas/User.js";
import AdminUser from "../config/schemas/AdminUser.js";
import ProfilePicture from "../config/schemas/ProfilePicture.js";

const router = express.Router();

// STEP 1: Save email to session
router.post("/", async (req, res) => {
  const email = req.body.email.toLowerCase().trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ errorType: "email", error: "Please enter a valid email" });
  }
  if (!email) {
    return res.status(400).json({ errorType: "email", error: "Email is required" });
  }
  try {
    // Ensure email is unique
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errorType: "email", error: "Email already taken" });
    } 
  } catch (err) {
    res.status(400).json({ errorType: "email", error: err.message });
  }  
  req.session.email = email;
  res.json({ success: true, nextStep: 2 });
});

// STEP 2: Save username + hashed password
router.post("/step2", async (req, res) => {
  const { username, password, "confirm-password": confirmPassword } = req.body;

  if (!username) {
    return res.status(400).json({ errorType: "username", error: "Username is required" });
  } else if (!password) {
    return res.status(400).json({ errorType: "password", error: "Password is required" });
  }

  try {
    // Ensure username is unique
    const adminuser = await AdminUser.findOne({username});
    const user = await User.findOne({username});
    const existingUser = adminuser || user;
    
    if (existingUser) {
      return res.status(400).json({ errorType: "username", error: "Username already taken" });
    } 

    if (username.length < 3 || username.length > 10) {
      return res.status(400).json({ errorType: "username", error: "Username must be between 3 and 10 characters" });
    }
  } catch (err) {
    res.status(400).json({ errorType: "server", error: err.message });
  }

  const validatePassword = (password) => {
    if (password.length < 8) {
      return { valid: false, error: "Password must be at least 8 characters long" };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: "Password must include at least one lowercase letter" };
    }
    if (!/\d/.test(password)) {
      return { valid: false, error: "Password must include at least one number" };
    }
    if (!/[@$!%*?&]/.test(password)) {
      return { valid: false, error: "Password must include at least one special character (@$!%*?&)" };
    }
    return { valid: true };
  };

  const result = validatePassword(password);
  if (!result.valid) {
    return res.status(400).json({ errorType: "password", error: result.error });
  }  

  if (!confirmPassword) {
    return res.status(400).json({ errorType: "confirm-password", error: "Please confirm your password" });
  } else if (password !== confirmPassword) {
    return res.status(400).json({ errorType: "confirm-password", error: "Passwords don't match" });
  }

  req.session.username = username;
  req.session.password = password; // will be hashed in User model pre-save hook

  res.json({ success: true, nextStep: 3 });
});

// STEP 3: Finalize user creation
router.post("/step3", async (req, res) => {
  const email = req.session.email;
  const username = req.session.username;
  const password = req.session.password;
  const { profile_pic_id } = req.body;

  if (!email || !username || !password ) {
    return res.status(400).json({ errorType: "profile-pic-grid", error: "Sorry something went wrong, please start the registration process again." });
  }


  if (!profile_pic_id || isNaN(profile_pic_id) || profile_pic_id < 1 || profile_pic_id > 6) {
    return res.status(400).json({ errorType: "profile-pic-grid", error: "Unable to select a valid profile picture, please try again." });
  }



  try {
    // Save user to DB
    const user = new User({ username, password, email });
    await user.save();

    const profilePic = new ProfilePicture({ userId: user._id, imageId: profile_pic_id });
    await profilePic.save();

    // Clear session after registration
    req.session.email = null;
    req.session.username = null;   
    req.session.password = null;
    req.session.profile_pic_id = null;

    req.session.user = { username: username, isAdmin: false };

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
