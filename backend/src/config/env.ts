import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/, "Use a duration such as 15m, 2h, or 7d").default("15m"),
  CLIENT_URL: z.string().min(1).default("http://localhost:3000"),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.coerce.number().int().positive().default(587),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration", z.treeifyError(parsed.error));
  process.exit(1);
}
if (parsed.data.NODE_ENV === "production") {
  const unsafeSecrets = ["replace-with-at-least-32-random-characters", "change-me", "secret"];
  if (unsafeSecrets.includes(parsed.data.JWT_SECRET.toLowerCase())) {
    console.error("JWT_SECRET must be a strong, unique value in production");
    process.exit(1);
  }
  const origins = parsed.data.CLIENT_URL.split(",").map((value) => value.trim());
  if (origins.some((origin) => !origin.startsWith("https://"))) {
    console.error("CLIENT_URL must contain only HTTPS origins in production");
    process.exit(1);
  }
  if (!parsed.data.EMAIL_HOST || !parsed.data.EMAIL_USER || !parsed.data.EMAIL_PASSWORD) {
    console.error("EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD are required in production");
    process.exit(1);
  }
  if (/localhost|127\.0\.0\.1/.test(parsed.data.MONGO_URI)) {
    console.error("MONGO_URI must point to a production database in production");
    process.exit(1);
  }
}
export const env = parsed.data;
