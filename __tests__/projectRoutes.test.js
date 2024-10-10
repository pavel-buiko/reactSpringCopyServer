import request from "supertest";
import app from "../app.js";
import knex from "../db.js";
import jwt from "jsonwebtoken";

describe("Project Routes", () => {
  let accessToken;
  let refreshToken;

  beforeAll(async () => {
    const loginResponse = await request(app).post("/api/login").send({
      username: "admin",
      password: "1234",
    });
    accessToken = loginResponse.body.accessToken;
    refreshToken = loginResponse.body.refreshToken;
  });

  describe("GET /api/cards", () => {
    it("should fetch all cards with valid access token", async () => {
      const response = await request(app)
        .get("/api/cards")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(6);
      response.body.forEach((card) => {
        expect(card).toHaveProperty("title");
        expect(card).toHaveProperty("description");
        expect(card).toHaveProperty("imgSrc");
        expect(card).toHaveProperty("link");
      });
    });

    it("should fail to fetch cards without access token", async () => {
      const response = await request(app).get("/api/cards");

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("message", "Token not provided");
    });

    it("should fail to fetch cards with invalid access token", async () => {
      const response = await request(app)
        .get("/api/cards")
        .set("Authorization", `Bearer invalidtoken`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    it("should fail to fetch cards with expired access token", async () => {
      const expiredAccessToken = jwt.sign(
        { userId: 1, username: "admin" },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "-10s" }
      );

      const response = await request(app)
        .get("/api/cards")
        .set("Authorization", `Bearer ${expiredAccessToken}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("message", "Token expired");
    });

    it("should refresh token and fetch cards when access token is expired", async () => {
      const expiredAccessToken = jwt.sign(
        { userId: 1, username: "admin" },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "-10s" }
      );

      const response = await request(app)
        .get("/api/cards")
        .set("Authorization", `Bearer ${expiredAccessToken}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("message", "Token expired");
    });

    it("should fail to refresh token with invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/token")
        .send({ refreshToken: "invalidtoken" });

      expect(response.statusCode).toBe(403);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    it("should fail to access protected route after logout", async () => {
      const logoutResponse = await request(app)
        .post("/api/logout")
        .send({ refreshToken });

      expect(logoutResponse.statusCode).toBe(200);
      expect(logoutResponse.body).toHaveProperty(
        "message",
        "Successfully logged out"
      );

      const refreshResponse = await request(app)
        .post("/api/token")
        .send({ refreshToken });

      expect(refreshResponse.statusCode).toBe(401);
      expect(refreshResponse.body).toHaveProperty(
        "message",
        "Token not provided"
      );

      const expiredAccessToken = jwt.sign(
        { userId: 1, username: "admin" },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "-10s" }
      );

      const cardsResponse = await request(app)
        .get("/api/cards")
        .set("Authorization", `Bearer ${expiredAccessToken}`);

      expect(cardsResponse.statusCode).toBe(401);
      expect(cardsResponse.body).toHaveProperty("message", "Token expired");
    });
  });
});
