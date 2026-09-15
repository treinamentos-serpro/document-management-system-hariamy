const path = require('path');
const ServiceError = require('../errors/ServiceError');
const { STORAGE_DIR } = require('../config');

const USER_ID_MAX_LENGTH = 100;

function validateUserId(rawUserId) {
  const userId = rawUserId && rawUserId.trim();

  if (!userId || userId.length === 0) {
    throw new ServiceError('UNAUTHORIZED', 'Usuário não autenticado. Envie um JWT válido no cabeçalho Authorization.', 401);
  }

  if (userId.length > USER_ID_MAX_LENGTH) {
    throw new ServiceError(
      'INVALID_USER_ID',
      'O identificador do usuário deve ter no máximo 100 caracteres.',
      400,
    );
  }

  return userId;
}

function validateOwner(rawOwner) {
  return validateUserId(rawOwner);
}

function validateLoginInput(userId, password) {
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw new ServiceError('INVALID_LOGIN', 'Informe usuário e senha para autenticar.', 400);
  }

  const validatedUserId = validateUserId(userId);

  if (typeof password !== 'string' || password.length === 0) {
    throw new ServiceError('INVALID_LOGIN', 'Informe usuário e senha para autenticar.', 400);
  }

  return {
    userId: validatedUserId,
    password,
  };
}

function ensureSafeStoragePath(filePath) {
  const storageRoot = path.resolve(STORAGE_DIR);
  const resolvedPath = path.resolve(filePath);
  const relativePath = path.relative(storageRoot, resolvedPath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new ServiceError('INVALID_STORAGE_PATH', 'Caminho do arquivo inválido.', 400);
  }

  return resolvedPath;
}

function validateDocumentId(id) {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new ServiceError('INVALID_DOCUMENT_ID', 'O identificador do documento é inválido.', 400);
  }
}

module.exports = {
  validateUserId,
  validateOwner,
  validateLoginInput,
  ensureSafeStoragePath,
  validateDocumentId,
};
