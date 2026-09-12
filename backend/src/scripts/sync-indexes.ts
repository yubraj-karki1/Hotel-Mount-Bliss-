import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { logger } from "../config/logger.js";
import "../models/audit-log.model.js";
import "../models/domain.model.js";
import "../models/user.model.js";

await connectDatabase();
try {
  const result = await (await import("mongoose")).default.connection.syncIndexes();
  logger.info({ result }, "MongoDB indexes synchronized");
} finally {
  await disconnectDatabase();
}
