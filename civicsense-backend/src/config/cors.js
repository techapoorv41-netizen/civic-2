const env = require('./env');

const allowed = new Set(env.corsOrigins);
if (env.NODE_ENV !== 'production') allowed.add('http://localhost:5173');

// exact origins, wildcard नहीं, credentials नहीं (tokens body/header में हैं)
module.exports = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // Postman / server-to-server
    return cb(null, allowed.has(origin));
  },
  credentials: false,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};