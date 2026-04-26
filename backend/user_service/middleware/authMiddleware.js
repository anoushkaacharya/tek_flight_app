const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, roles: ["ADMIN"] }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please log in again." });
    }
    return res.status(403).json({ message: "Invalid token." });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.roles?.includes("ADMIN")) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

exports.requireRole = (...roles) => (req, res, next) => {
  const hasRole = req.user?.roles?.some(r => roles.includes(r));
  if (!hasRole) {
    return res.status(403).json({ message: `Access denied. Required: ${roles.join(" or ")}` });
  }
  next();
};