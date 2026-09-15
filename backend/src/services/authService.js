const jwt = require('jsonwebtoken');
const ServiceError = require('../errors/ServiceError');
const userRepository = require('../repositories/userRepository');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const { validateLoginInput } = require('../utils/documentValidation');

function login({ userId, password }) {
  const validatedInput = validateLoginInput(userId, password);
  const user = userRepository.findByCredentials(validatedInput.userId, validatedInput.password);

  if (!user) {
    throw new ServiceError('INVALID_CREDENTIALS', 'Usuário ou senha inválidos.', 401);
  }

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    user: {
      id: user.id,
    },
  };
}

module.exports = {
  login,
  ServiceError,
};
