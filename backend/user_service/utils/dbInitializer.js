const bcrypt = require("bcryptjs");
const { User, Role, UserRole } = require("../models/index");

const dataInitializer = async () => {
  console.log("Initializing data...");

  try {
    // Seed roles first
    const [adminRole] = await Role.findOrCreate({ where: { role_name: "ADMIN" } });
    const [userRole]  = await Role.findOrCreate({ where: { role_name: "USER"  } });
    console.log("Roles seeded");

    // Seed admin user
    const adminEmail    = process.env.ADMIN_EMAIL    || "admin@test.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const [adminUser, created] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        firstName:   "Admin",
        lastName:    "User",
        phoneNumber: "1234056789",
        password:    await bcrypt.hash(adminPassword, 10),
      },
    });

    if (created) {
      // Assign ADMIN role in user_roles table
      await UserRole.findOrCreate({
        where: { user_id: adminUser.user_id, role_id: adminRole.role_id },
      });
      console.log("Admin user created and role assigned");
    } else {
      console.log(`Admin already exists (${adminEmail})`);
    }

  } catch (error) {
    console.error("Error initializing data:", error.message);
  }
};

module.exports = dataInitializer;