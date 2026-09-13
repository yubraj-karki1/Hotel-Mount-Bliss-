import { describe, expect, it } from "vitest";
import { roomInput } from "./domain.routes.js";
import { User } from "../models/user.model.js";

const validRoom = { name: "Mountain Suite", type: "Suite", capacity: 2, bed: "Queen bed", price: 3500, floor: 2, images: ["/uploads/room-photos/5e457d8a-39c8-4dc1-94ba-711796fe353e.jpg"] };

describe("room creation validation", () => {
  it("requires at least one uploaded room photo", () => {
    const result = roomInput.safeParse({ ...validRoom, images: [] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("Please upload at least one room photo.");
  });

  it("rejects arbitrary image URLs", () => {
    expect(roomInput.safeParse({ ...validRoom, images: ["https://example.com/not-uploaded.jpg"] }).success).toBe(false);
  });

  it("accepts multiple stored room photos", () => {
    expect(roomInput.safeParse({ ...validRoom, images: [...validRoom.images, "/uploads/room-photos/f9327062-a242-4952-a3ab-cee8de827901.webp"] }).success).toBe(true);
  });
});

describe("sensitive model serialization", () => {
  it("never serializes password material", () => {
    const user = new User({ name: "Staff User", email: "staff@example.com", phone: "9800000000", password: "hashed-secret", passwordResetToken: "reset-secret", role: "ADMIN" });
    expect(user.toJSON()).not.toHaveProperty("password");
    expect(user.toJSON()).not.toHaveProperty("passwordResetToken");
  });
});
