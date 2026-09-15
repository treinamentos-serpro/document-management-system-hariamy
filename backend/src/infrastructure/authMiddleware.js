const jwt = require('jsonwebtoken');
const ServiceError = require('../errors/ServiceError');
const { JWT_SECRET } = require('../config');
const { validateUserId } = require('../utils/documentValidation');

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader) {
    throw new ServiceError('UNAUTHORIZED', 'Usuário não autenticado. Envie um JWT válido no cabeçalho Authorization.', 401);
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new ServiceError('UNAUTHORIZED', 'Usuário não autenticado. Envie um JWT válido no cabeçalho Authorization.', 401);
  }

  return token;
}

function authenticate(req, res, next) {
  try {
    const token = extractBearerToken(req.get('Authorization'));
    const payload = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: validateUserId(payload?.sub),
    };

    next();
  } catch (error) {
    if (error instanceof ServiceError) {
      next(error);
      return;
    }

    next(new ServiceError('UNAUTHORIZED', 'Token de autenticação inválido ou expirado.', 401));
  }
}

module.exports = {
  authenticate,
};
