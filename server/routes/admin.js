import express from "express";
import { fileURLToPath } from "url";
import auth from "../middleware/authMiddleware.js";
import path from "path";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/", auth.requireAdminLogin, (req, res) => {
  // Serve the admin page
  res.sendFile(path.resolve(__dirname, "..", "..", "client", "admin", "admin.html"));
});

export default router;