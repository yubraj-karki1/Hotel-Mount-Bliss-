import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { logger } from "./config/logger.js";
import { HotelService, Room } from "./models/domain.model.js";
import { User } from "./models/user.model.js";

await connectDatabase();
try {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 8) throw new Error("SEED_ADMIN_PASSWORD must contain at least 8 characters");
    await User.findOneAndUpdate({ email: adminEmail }, { $setOnInsert: { name: "Hotel Administrator", email: adminEmail, phone: process.env.SEED_ADMIN_PHONE ?? "+977-0000000000", password: await bcrypt.hash(adminPassword, 12), role: "ADMIN", isActive: true, isEmailVerified: true } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  } else logger.warn("SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD not set; admin account was not seeded");

  const rooms = [
    { name: "Standard Room", type: "Standard", description: "A comfortable room for one or two guests.", capacity: 2, bed: "Double bed", price: 1500, floor: 1, amenities: ["Wi-Fi", "Hot water", "Television"] },
    { name: "Deluxe Room", type: "Deluxe", description: "A spacious room with mountain-facing ambience.", capacity: 2, bed: "Queen bed", price: 2500, floor: 2, amenities: ["Wi-Fi", "Hot water", "Television", "Breakfast"] },
    { name: "Family Room", type: "Family", description: "Extra space for families and small groups.", capacity: 4, bed: "Queen bed and two singles", price: 3500, floor: 3, amenities: ["Wi-Fi", "Hot water", "Television", "Breakfast"] },
  ];
  for (const room of rooms) await Room.updateOne({ name: room.name }, { $setOnInsert: room }, { upsert: true });
  for (const service of [{ name: "Room Service", description: "Food and refreshments delivered to your room.", price: 300 }, { name: "Laundry", description: "Same-day laundry service.", price: 250 }, { name: "Breakfast", description: "Fresh daily breakfast.", price: 400 }, { name: "Airport Pickup", description: "Pre-arranged airport transfer.", price: 1800 }, { name: "Extra Bed", description: "Additional bed, subject to room capacity.", price: 700 }]) await HotelService.updateOne({ name: service.name }, { $setOnInsert: service }, { upsert: true });
  logger.info("Seed completed");
} finally { await disconnectDatabase(); }
