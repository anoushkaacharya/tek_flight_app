const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
async function createAdmin() {
  try {
    const existingAdmin = await User.findOne({ where: { email: "admin@test.com" } });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin",
        email: "admin@test.com",
        password: hashed,
        role: "ADMIN",
      });
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }
  } catch (err) {
    console.error("Error creating admin:", err.message);
  }
}
if (require.main === module) {
  createAdmin();
}
module.exports = createAdmin;