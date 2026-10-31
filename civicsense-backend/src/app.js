const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const pinoHttp = require('pino-http');
const env = require('./config/env');
const logger = require('./shared/logger');
const routes = require('./routes');
const AppError = require('./shared/errors/AppError');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(require('./config/cors')));
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));

if (env.STORAGE_DRIVER === 'local') app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  const up = mongoose.connection.readyState === 1;
  res.status(up ? 200 : 503).json({
    success: up,
    data: { status: up ? 'healthy' : 'degraded', db: up ? 'connected' : 'disconnected' },
  });
});

// SWAGGER_LINE_HERE

app.use('/api/v1', routes);
app.use((req, res, next) => next(new AppError(404, 'NOT_FOUND', 'Route not found')));
app.use(errorHandler);

module.exports = app;