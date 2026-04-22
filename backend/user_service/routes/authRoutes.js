const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
router.post("/admin/login", authController.login);
router.post("/user/login", authController.login);
router.post("/user/register", authController.register);
router.get("/test", (req, res) => {
  res.send("Auth route working");
});
module.exports = router;