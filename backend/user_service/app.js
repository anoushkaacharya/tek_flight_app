const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("User Service Running");
});
app.use("/api/v1.0/flight", authRoutes);
module.exports = app;