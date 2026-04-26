const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.user_id,
      email:  user.email,
      roles:  user.roles,   // now an array e.g. ["ADMIN"] or ["USER"]
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};