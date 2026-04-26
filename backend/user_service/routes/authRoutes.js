const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// Public routes — no token needed
router.post("/user/register", authController.register);
router.post("/user/login", authController.login);
router.post("/admin/login", authController.login);

// Protected route example — any logged-in user
router.get("/user/profile", verifyToken, (req, res) => {
  res.json({ message: "Profile fetched", user: req.user });
});

// Protected route example — admin only (verifyToken must run first)
router.get("/admin/users", verifyToken, requireAdmin, (req, res) => {
  res.json({ message: "Admin access granted", requestedBy: req.user });
});

router.get("/test", (req, res) => {
  res.send("Auth route working");
});

module.exports = router;