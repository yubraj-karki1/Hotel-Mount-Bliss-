import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "./app.js";
import { Booking, Room } from "./models/domain.model.js";

afterEach(() => vi.restoreAllMocks());

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
  it("allows this project's Vercel production and preview origins", async () => {
    const response = await request(app).get("/health/live").set("Origin", "https://hotel-mount-bliss-git-main-example.vercel.app");
    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("https://hotel-mount-bliss-git-main-example.vercel.app");
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
  it("calculates a guest booking quote with normalized JSON dates", async () => {
    vi.spyOn(Room, "findOne").mockResolvedValue({ _id: "507f1f77bcf86cd799439011", capacity: 2, price: 2500 } as never);
    vi.spyOn(Booking, "exists").mockResolvedValue(null);
    const response = await request(app).post("/api/v1/bookings/quote").send({
      roomId: "507f1f77bcf86cd799439011",
      checkIn: "2026-10-01",
      checkOut: "2026-10-03",
      guests: 2,
      specialRequests: "",
      guestName: "Audit Guest",
      guestEmail: "audit@example.com",
      guestPhone: "9800000000",
      addOnIds: [],
    });
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ nights: 2, roomTotal: 5000, totalAmount: 5000 });
  });
  it("validates public waitlist requests before database access", async () => {
    const response = await request(app).post("/api/v1/waitlist").send({ email: "invalid" });
    expect(response.status).toBe(422);
  });
  it("rate limits repeated guest booking lookups", async () => {
    const attempts = await Promise.all(Array.from({ length: 21 }, () => request(app).post("/api/v1/bookings/lookup").send({})));
    expect(attempts.some((response) => response.status === 429)).toBe(true);
  });
  it("validates public account registration before database access", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({ email: "invalid", password: "weak" });
    expect(response.status).toBe(422);
  });
});
