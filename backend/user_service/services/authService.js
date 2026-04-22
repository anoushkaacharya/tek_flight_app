const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwtUtil");
//mock
const users = [
  {
    id: 1,
    name: "Admin",
    email: "admin@test.com",
    password: null,
    role: "ADMIN",
  },
];
//how admin password works
const initializeAdminPassword = async () => {
  const plainPassword = "admin123"; //original password
  const hashed = await bcrypt.hash(plainPassword, 10); //bcrypt hashing
  users[0].password = hashed;
  console.log("Admin password hashed:", hashed);
};
initializeAdminPassword();
exports.login = async ({email, password }) => {
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error("User not found");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");
  const token = generateToken(user);
  return { token, role: user.role };
}
exports.register = async ({ name, email, password }) => {
  const hashed = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password: hashed,
    role: "USER",
  };
  users.push(newUser);
  return {message: "User registered" };
};