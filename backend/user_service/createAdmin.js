const bcrypt = require("bcryptjs");
const sequelize = require("./config/db");
const User = require("./models/userModel");

(async () => {
  try {
    await sequelize.sync();

    const existingAdmin = await User.findOne({
      where: { email: "admin@test.com" },
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashed = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Admin",
      email: "admin@test.com",
      password: hashed,
      role: "ADMIN",
    });

    console.log("Admin created successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();