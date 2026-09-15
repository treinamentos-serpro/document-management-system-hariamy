const express = require('express');
const authController = require('../controllers/authController');
const { AUTH_RATE_LIMIT_WINDOW_MS, AUTH_RATE_LIMIT_MAX_REQUESTS } = require('../config');
const { createRateLimit } = require('../infrastructure/rateLimitMiddleware');

const router = express.Router();
const authRateLimit = createRateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  maxRequests: AUTH_RATE_LIMIT_MAX_REQUESTS,
});

router.post('/login', authRateLimit, authController.login);

module.exports = router;
