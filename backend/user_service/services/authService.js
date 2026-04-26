const bcrypt = require("bcryptjs");
const { User, Role, UserRole } = require("../models/index");
const { generateToken } = require("../utils/jwtUtil");

// ─── login ─────────────────────────────────────────────────────
exports.login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Fetch user WITH their roles joined
  const user = await User.findOne({
    where: { email },
    include: [{ model: Role, as: "roles", attributes: ["role_name"] }],
  });

  // ─── DEBUG (remove after fix) ───────────────────────────────
  console.log("LOGIN DEBUG — email attempted:", email);
  console.log("LOGIN DEBUG — user found:", user ? user.email : "NOT FOUND");
  console.log("LOGIN DEBUG — roles:", user ? JSON.stringify(user.roles) : "N/A");
  console.log("LOGIN DEBUG — hashed password in DB:", user ? user.password : "N/A");
  // ────────────────────────────────────────────────────────────

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);

  // ─── DEBUG (remove after fix) ───────────────────────────────
  console.log("LOGIN DEBUG — password match:", isMatch);
  // ────────────────────────────────────────────────────────────

  if (!isMatch) throw new Error("Invalid credentials");

  const roles = user.roles.map(r => r.role_name);
  const token = generateToken({ ...user.toJSON(), roles });

  return { token, roles };
};

// ─── register ──────────────────────────────────────────────────
exports.register = async ({
  firstName, lastName, email, phoneNumber, password, confirmPassword,
}) => {
  if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
    throw new Error("All fields are required");
  }

  firstName   = firstName.trim();
  lastName    = lastName.trim();
  email       = email.trim();
  phoneNumber = phoneNumber.trim();

  if (password !== confirmPassword)      throw new Error("Passwords do not match");
  if (password.length < 6)              throw new Error("Password must be at least 6 characters");
  if (!/^[a-zA-Z]+$/.test(firstName))  throw new Error("First name must contain only letters");
  if (!/^[a-zA-Z]+$/.test(lastName))   throw new Error("Last name must contain only letters");
  if (!/^\d{10,15}$/.test(phoneNumber)) throw new Error("Phone number must be 10-15 digits");
  if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) throw new Error("Invalid email format");

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser)  throw new Error("User already exists");

  const existingPhone = await User.findOne({ where: { phoneNumber } });
  if (existingPhone)  throw new Error("Phone number already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user first
  const newUser = await User.create({
    firstName, lastName, email, phoneNumber,
    password: hashedPassword,
  });

  // ─── DEBUG (remove after fix) ───────────────────────────────
  console.log("REGISTER DEBUG — user created:", newUser.user_id, newUser.email);
  // ────────────────────────────────────────────────────────────

  // Then assign USER role in user_roles table
  const userRole = await Role.findOne({ where: { role_name: "USER" } });

  // ─── DEBUG (remove after fix) ───────────────────────────────
  console.log("REGISTER DEBUG — USER role found:", userRole ? userRole.role_id : "NOT FOUND");
  // ────────────────────────────────────────────────────────────

  if (userRole) {
    await UserRole.create({
      user_id: newUser.user_id,
      role_id: userRole.role_id,
    });
    // ─── DEBUG (remove after fix) ─────────────────────────────
    console.log("REGISTER DEBUG — role assigned to user");
    // ──────────────────────────────────────────────────────────
  } else {
    // ─── DEBUG (remove after fix) ─────────────────────────────
    console.log("REGISTER DEBUG — WARNING: USER role not found, role NOT assigned");
    // ──────────────────────────────────────────────────────────
  }

  return { success: true };
};