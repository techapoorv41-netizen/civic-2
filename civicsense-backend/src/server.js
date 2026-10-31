const app = require('./app');
const env = require('./config/env');
const logger = require('./shared/logger');
const { connectDB } = require('./database/connection');

(async () => {
  await connectDB();
  const server = app.listen(env.PORT, () =>
    logger.info(`API running on ${env.PORT}`)
  );
  const shutdown = () =>
    server.close(() => {
      logger.info('shutdown');
      process.exit(0);
    });
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
})();