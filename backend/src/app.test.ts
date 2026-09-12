import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./app.js";

describe("HTTP application", () => {
  it("reports a healthy service", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("ok");
  });
  it("reports liveness independently of database readiness", async () => {
    const response = await request(app).get("/health/live");
    expect(response.status).toBe(200);
    expect(response.headers["x-request-id"]).toBeTruthy();
  });
  it("reports unavailable readiness without a database connection", async () => {
    const response = await request(app).get("/health/ready");
    expect(response.status).toBe(503);
    expect(response.body.success).toBe(false);
  });
  it("rejects unknown browser origins", async () => {
    const response = await request(app).get("/health/live").set("Origin", "https://attacker.example");
    expect(response.status).toBe(403);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
  it("returns the standard not-found response", async () => {
    const response = await request(app).get("/missing-route");
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
  it("protects staff booking lists", async () => {
    const response = await request(app).get("/api/v1/bookings");
    expect(response.status).toBe(401);
  });
  it("protects notification lists", async () => {
    const response = await request(app).get("/api/v1/notifications");
    expect(response.status).toBe(401);
  });
  it("protects notification read actions", async () => {
    const response = await request(app).patch("/api/v1/notifications/read-all");
    expect(response.status).toBe(401);
  });
  it("validates contact messages before database access", async () => {
    const response = await request(app).post("/api/v1/contact").send({ name:"A", email:"invalid", subject:"x", message:"short" });
    expect(response.status).toBe(422);
  });
  it("validates guest booking quotes", async () => {
    const response = await request(app).post("/api/v1/bookings/quote").send({});
    expect(response.status).toBe(422);
  });
  it("validates public waitlist requests before database access", async () => {
    const response = await request(app).post("/api/v1/waitlist").send({ email: "invalid" });
    expect(response.status).toBe(422);
  });
  it("rate limits repeated guest booking lookups", async () => {
    const attempts = await Promise.all(Array.from({ length: 21 }, () => request(app).post("/api/v1/bookings/lookup").send({})));
    expect(attempts.some((response) => response.status === 429)).toBe(true);
  });
  it("does not expose public account registration", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({ email: "invalid", password: "weak" });
    expect(response.status).toBe(404);
  });
});
