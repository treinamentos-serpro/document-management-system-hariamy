const ServiceError = require('../errors/ServiceError');

function createRateLimit({ windowMs, maxRequests }) {
  const requestsByClient = new Map();

  return function rateLimit(req, res, next) {
    const clientId = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const existingEntry = requestsByClient.get(clientId);

    if (!existingEntry || existingEntry.resetAt <= now) {
      requestsByClient.set(clientId, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (existingEntry.count >= maxRequests) {
      next(new ServiceError('RATE_LIMIT_EXCEEDED', 'Muitas requisições em sequência. Tente novamente em instantes.', 429));
      return;
    }

    existingEntry.count += 1;
    next();
  };
}

module.exports = {
  createRateLimit,
};
