import { createLogger, format, transports } from "winston";
import LokiTransport from "winston-loki";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new LokiTransport({
      host: "http://localhost:3100",
      labels: {
        app: "findyourhome-backend",
        env: process.env.NODE_ENV || "development",
      },
      json: true,
      replaceTimestamp: true,
      onConnectionError: (err) => {
        console.error("❌ Loki connection error:", err);
      },
    }),
    new transports.Console(), //  log locally
  ],
});
export default logger;