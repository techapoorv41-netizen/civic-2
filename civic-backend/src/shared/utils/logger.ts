import pino from "pino";
import pinoHttp from "pino-http";

const isTest = process.env.NODE_ENV === "test";

export const logger = pino({
  level: isTest ? "silent" : process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.body.password",
      "req.body.refreshToken",
      "*.password",
      "*.passwordHash",
      "*.apiKey",
      "*.token",
    ],
    censor: "[REDACTED]",
  },
});

export const httpLogger = pinoHttp({
  logger,
  autoLogging: !isTest,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
});

export default logger;
