import express from "express";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", auth.requireAdminLogin, (req, res) => {
  // Serve the admin page
  res.render("admin");
});

router.get("/users", auth.requireAdminLogin, (req, res) => {
  // Serve the admin page
  res.render("admin_users");
});

router.get("/imagebase", auth.requireAdminLogin, (req, res) => {
  // Serve the admin page
  res.render("admin_imagebase");
});


export default router;