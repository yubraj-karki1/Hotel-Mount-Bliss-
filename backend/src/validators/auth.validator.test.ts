import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth.validator.js";

describe("authentication validation", () => {
  it("accepts a valid customer registration and strips unrecognized role input", () => {
    const result = registerSchema.parse({ body: { name: "Demo Guest", email: "GUEST@example.com", phone: "+9779800000000", password: "SecurePass1", role: "ADMIN" } });
    expect(result.body.email).toBe("guest@example.com");
    expect(result.body).not.toHaveProperty("role");
  });

  it("rejects weak passwords", () => {
    expect(registerSchema.safeParse({ body: { name: "Demo Guest", email: "guest@example.com", phone: "9800000000", password: "password" } }).success).toBe(false);
  });

  it("rejects malformed login email addresses", () => {
    expect(loginSchema.safeParse({ body: { email: "invalid", password: "anything" } }).success).toBe(false);
  });

  it("defaults login persistence to a browser session", () => {
    const result = loginSchema.parse({ body: { email: "guest@example.com", password: "anything" } });
    expect(result.body.rememberMe).toBe(false);
  });

  it("accepts an explicit remembered login", () => {
    const result = loginSchema.parse({ body: { email: "guest@example.com", password: "anything", rememberMe: true } });
    expect(result.body.rememberMe).toBe(true);
  });
});
