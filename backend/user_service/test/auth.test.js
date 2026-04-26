process.env.JWT_SECRET = "test_secret_key";

const request = require("supertest");
const app     = require("../app");

// ─── Mock all models inline ────────────────────────────────────
jest.mock("../models/index", () => ({
  User: {
    findOne: jest.fn(),
    create:  jest.fn(),
    findAll: jest.fn(),
  },
  Role: {
    findOne:      jest.fn(),
    create:       jest.fn(),
    findOrCreate: jest.fn(),
  },
  UserRole: {
    findOne:      jest.fn(),
    create:       jest.fn(),
    findOrCreate: jest.fn(),
  },
}));

// ─── Mock DB connection ────────────────────────────────────────
jest.mock("../config/db", () => ({
  define: jest.fn(),
  sync:   jest.fn().mockResolvedValue(true),
  close:  jest.fn().mockResolvedValue(true),
  query:  jest.fn().mockResolvedValue([]),
}));

const { User, Role, UserRole } = require("../models/index");

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Registration tests ────────────────────────────────────────

describe("Register", () => {

  test("successfully registers a new user", async () => {
    User.findOne.mockResolvedValue(null);
    Role.findOne.mockResolvedValue({ role_id: 1, role_name: "USER" });
    User.create.mockResolvedValue({ user_id: 1, email: "test@example.com" });
    UserRole.create.mockResolvedValue({});

    const res = await request(app)
      .post("/api/v1.0/flight/user/register")
      .send({
        firstName:       "Test",
        lastName:        "User",
        email:           "test@example.com",
        phoneNumber:     "9876543210",
        password:        "123456",
        confirmPassword: "123456",
      });

    expect(res.statusCode).toBe(201);
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(UserRole.create).toHaveBeenCalledTimes(1);
  });

  test("fails with missing fields", async () => {
    const res = await request(app)
      .post("/api/v1.0/flight/user/register")
      .send({
        firstName:       "Test",
        email:           "test@example.com",
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
        email:           "test@example.com",
        phoneNumber:     "9876543210",
        password:        "123456",
        confirmPassword: "999999",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Passwords do not match");
  });

  test("fails when email already exists", async () => {
    User.findOne.mockResolvedValue({ user_id: 1, email: "test@example.com" });

    const res = await request(app)
      .post("/api/v1.0/flight/user/register")
      .send({
        firstName:       "Test",
        lastName:        "User",
        email:           "test@example.com",
        phoneNumber:     "9876543210",
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
        email:           "test@example.com",
        phoneNumber:     "123",
        password:        "123456",
        confirmPassword: "123456",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Phone number must be 10-15 digits");
  });

});

// ─── Login tests ───────────────────────────────────────────────

describe("Login", () => {

  test("successfully logs in and returns a token", async () => {
    const bcrypt         = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("123456", 10);

    User.findOne.mockResolvedValue({
      user_id:  1,
      email:    "test@example.com",
      password: hashedPassword,
      roles:    [{ role_name: "USER" }],
      toJSON:   () => ({ user_id: 1, email: "test@example.com", password: hashedPassword }),
    });

    const res = await request(app)
      .post("/api/v1.0/flight/user/login")
      .send({ email: "test@example.com", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.roles).toContain("USER");
  });

  test("fails with wrong password", async () => {
    const bcrypt         = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("123456", 10);

    User.findOne.mockResolvedValue({
      user_id:  1,
      email:    "test@example.com",
      password: hashedPassword,
      roles:    [{ role_name: "USER" }],
      toJSON:   () => ({ user_id: 1, email: "test@example.com" }),
    });

    const res = await request(app)
      .post("/api/v1.0/flight/user/login")
      .send({ email: "test@example.com", password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  test("fails with non-existent email", async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/v1.0/flight/user/login")
      .send({ email: "nobody@example.com", password: "123456" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("User not found");
  });

  test("fails with missing fields", async () => {
    const res = await request(app)
      .post("/api/v1.0/flight/user/login")
      .send({ email: "test@example.com" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Email and password are required");
  });

});