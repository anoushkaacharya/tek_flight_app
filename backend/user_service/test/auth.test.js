const request  = require("supertest");
const app      = require("../app");
const sequelize = require("../config/db");
const { User, Role, UserRole } = require("../models/index");

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Seed roles
  await Role.create({ role_name: "USER" });
  await Role.create({ role_name: "ADMIN" });

  // Pre-register a user so login tests have someone to log in as
  // This makes login tests independent of the register describe block
  await request(app)
    .post("/api/v1.0/flight/user/register")
    .send({
      firstName:       "Test",
      lastName:        "User",
      email:           "test@example.com",
      phoneNumber:     "9876543210",
      password:        "123456",
      confirmPassword: "123456",
    });
});

afterAll(async () => {
  await sequelize.close();
});

// ─── Registration tests ────────────────────────────────────────

describe("Register", () => {

  test("successfully registers a new user", async () => {
    const res = await request(app)
      .post("/api/v1.0/flight/user/register")
      .send({
        firstName:       "Test",
        lastName:        "User",
        email:           "user@example.com",
        phoneNumber:     "9876543290",
        password:        "123456",
        confirmPassword: "123456",
      });

    expect(res.statusCode).toBe(201);

    // Verify user was actually created in DB
    const user = await User.findOne({ where: { email: "test@example.com" } });
    expect(user).not.toBeNull();

    // Verify USER role was assigned in user_roles table
    const userRole = await Role.findOne({ where: { role_name: "USER" } });
    const mapping  = await UserRole.findOne({
      where: { user_id: user.user_id, role_id: userRole.role_id },
    });
    expect(mapping).not.toBeNull();
  });

  test("fails with missing fields", async () => {
    const res = await request(app)
      .post("/api/v1.0/flight/user/register")
      .send({
        firstName:       "Test",
        email:           "test2@example.com",
        password:        "123456",
        confirmPassword: "123456",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });

  test("fails when passwords do not match", async () => {
    const res = await request(app)
      .post("/api/v1.0/flight/user/register")
      .send({
        firstName:       "Test",
        lastName:        "User",
        email:           "test3@example.com",
        phoneNumber:     "9876543211",
        password:        "123456",
        confirmPassword: "999999",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Passwords do not match");
  });

  test("fails when email already exists", async () => {
    const res = await request(app)
      .post("/api/v1.0/flight/user/register")
      .send({
        firstName:       "Test",
        lastName:        "User",
        email:           "test@example.com", // already registered above
        phoneNumber:     "9876543212",
        password:        "123456",
        confirmPassword: "123456",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  test("fails with invalid phone number", async () => {
    const res = await request(app)
      .post("/api/v1.0/flight/user/register")
      .send({
        firstName:       "Test",
        lastName:        "User",
        email:           "test4@example.com",
        phoneNumber:     "123",             // too short
        password:        "123456",
        confirmPassword: "123456",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Phone number must be 10-15 digits");
  });

});

// ─── Login tests ───────────────────────────────────────────────
test("debug — check what's in DB before login", async () => {
  const users = await User.findAll();
  const roles  = await Role.findAll();
  const mappings = await UserRole.findAll();

  console.log("Users in DB:", JSON.stringify(users.map(u => ({ id: u.user_id, email: u.email }))));
  console.log("Roles in DB:", JSON.stringify(roles.map(r => ({ id: r.role_id, name: r.role_name }))));
  console.log("UserRoles in DB:", JSON.stringify(mappings));
});

describe("Login", () => {

  test("successfully logs in and returns a token", async () => {
    const res = await request(app)
      .post("/api/v1.0/flight/user/login")
      .send({
        email:    "test@example.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.roles).toContain("USER");
  });

  test("fails with wrong password", async () => {
    const res = await request(app)
      .post("/api/v1.0/flight/user/login")
      .send({
        email:    "test@example.com",
        password: "wrongpassword",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  test("fails with non-existent email", async () => {
    const res = await request(app)
      .post("/api/v1.0/flight/user/login")
      .send({
        email:    "nobody@example.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("User not found");
  });

  test("fails with missing fields", async () => {
    const res = await request(app)
      .post("/api/v1.0/flight/user/login")
      .send({ email: "test@example.com" }); // no password

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Email and password are required");
  });

});