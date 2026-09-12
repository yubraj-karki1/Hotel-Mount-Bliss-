import { createServer } from "node:http";
import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
const server = createServer(app);
await connectDatabase();
server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "Hotel Mount Bliss API started");
  console.log(`\n🏨 Hotel Mount Bliss backend is running`);
  console.log(`🚀 Server:     http://localhost:${env.PORT}`);
  console.log(`🔗 API:        http://localhost:${env.PORT}/api/v1`);
  console.log(`💚 Health:     http://localhost:${env.PORT}/health`);
  console.log(`🗄️  MongoDB:    connected\n`);
});
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`\n❌ Port ${env.PORT} is already in use. Stop the other backend process or change PORT in backend/.env.\n`);
  } else {
    logger.error({ err: error }, "HTTP server failed");
  }
  void disconnectDatabase().finally(() => process.exit(1));
});
let shuttingDown = false;
const shutdown = (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Graceful shutdown started");
  const deadline = setTimeout(() => {
    logger.error("Graceful shutdown timed out");
    process.exit(1);
  }, 10_000);
  deadline.unref();
  server.close(() => {
    clearTimeout(deadline);
    void disconnectDatabase().then(() => process.exit(0), (error) => {
      logger.error({ err: error }, "Database disconnect failed");
      process.exit(1);
    });
  });
};
process.on("SIGINT", () => shutdown("SIGINT")); process.on("SIGTERM", () => shutdown("SIGTERM"));
