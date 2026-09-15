const express = require('express');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const authController = require('../controllers/authController');
const { AUTH_RATE_LIMIT_WINDOW_MS, AUTH_RATE_LIMIT_MAX_REQUESTS } = require('../config');

const router = express.Router();
const authRateLimit = rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  limit: AUTH_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => [ipKeyGenerator(req.ip || 'unknown'), String(req.body?.userId || '').trim() || 'anonymous'].join(':'),
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Muitas requisições em sequência. Tente novamente em instantes.',
      },
    });
  },
});

router.post('/login', authRateLimit, authController.login);

module.exports = router;
