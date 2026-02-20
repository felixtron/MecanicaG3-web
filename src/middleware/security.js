const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const securityMiddleware = [
  helmet({
    contentSecurityPolicy: false, // Disabled to allow inline scripts (tracking, analytics)
    crossOriginEmbedderPolicy: false // Allow iframes (Google Maps)
  }),
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://mecanicag3.com', 'https://www.mecanicag3.com']
      : '*'
  })
];

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: { status: 0, msg: 'Demasiadas solicitudes, por favor intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { securityMiddleware, apiLimiter };
