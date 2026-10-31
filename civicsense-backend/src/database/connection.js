const mongoose = require('mongoose');
const env = require('../config/env');
const logger = require('../shared/logger');

async function connectDB() {
  mongoose.connection.on('error', (e) => logger.error({ e }, 'mongo error'));
  await mongoose.connect(env.DATABASE_URL);
  logger.info('MongoDB connected');
}

module.exports = { connectDB };