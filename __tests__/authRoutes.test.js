import request from "supertest";
import app from "../app.js";
import knex from "../db.js";
import bcrypt from "bcrypt";

describe("Auth Routes", () => {
  describe("POST /api/login", () => {
    it("should fail login with incorrect password", async () => {
      const response = await request(app).post("/api/login").send({
        username: "admin",
        password: "wrongpassword",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid credentials");
    });

    it("should fail login with non-existent username", async () => {
      const response = await request(app).post("/api/login").send({
        username: "nonexistent",
        password: "password123",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid credentials");
    });
  });

  describe("POST /api/token", () => {
    let refreshToken;

    beforeAll(async () => {
      const loginResponse = await request(app).post("/api/login").send({
        username: "admin",
        password: "1234",
      });
      refreshToken = loginResponse.body.refreshToken;
    });

    it("should fail to refresh token with invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/token")
        .send({ refreshToken: "invalidtoken" });

      expect(response.statusCode).toBe(403);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    it("should fail to refresh token when refresh token is not provided", async () => {
      const response = await request(app).post("/api/token").send({});

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("message", "Token not provided");
    });
  });

  describe("POST /api/logout", () => {
    let refreshToken;

    beforeAll(async () => {
      const loginResponse = await request(app).post("/api/login").send({
        username: "admin",
        password: "1234",
      });
      refreshToken = loginResponse.body.refreshToken;
    });

    it("should logout successfully with valid refresh token", async () => {
      const response = await request(app)
        .post("/api/logout")
        .send({ refreshToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Successfully logged out"
      );
    });

    it("should logout successfully with invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/logout")
        .send({ refreshToken: "invalidtoken" });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Successfully logged out"
      );
    });
  });

  describe("POST /api/signup", () => {
    const newUser = {
      firstName: "New",
      lastName: "User",
      username: "newuser",
      password: "newpassword123",
      confirmPassword: "newpassword123",
      age: 30,
    };

    afterAll(async () => {
      await knex("users").where({ username: newUser.username }).del();
    });

    it("should signup successfully with valid data", async () => {
      const response = await request(app).post("/api/signup").send(newUser);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Registration successful"
      );

      const user = await knex("users")
        .where({ username: newUser.username })
        .first();
      expect(user).toBeDefined();
      expect(user.firstName).toBe(newUser.firstName);
      expect(user.lastName).toBe(newUser.lastName);
      expect(user.age).toBe(newUser.age);
      const isPasswordValid = await bcrypt.compare(
        newUser.password,
        user.password
      );
      expect(isPasswordValid).toBe(true);
    });

    it("should fail signup with invalid data", async () => {
      const response = await request(app).post("/api/signup").send({
        firstName: "",
        lastName: "User",
        username: "invaliduser",
        password: "short",
        confirmPassword: "short",
        age: -15,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toHaveProperty("firstName");
      expect(response.body.errors).toHaveProperty("password");
      expect(response.body.errors).toHaveProperty("age");
    });
  });
});
