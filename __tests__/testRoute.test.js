import request from "supertest";
import app from "../app.js";

describe("Server", () => {
  it("GET /api/test should return success message", async () => {
    const response = await request(app).get("/api/test");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Server is connected to frontend"
    );
  });
});
