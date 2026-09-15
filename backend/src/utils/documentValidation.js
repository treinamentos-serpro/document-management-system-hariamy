const path = require('path');
const ServiceError = require('../errors/ServiceError');
const { STORAGE_DIR } = require('../config');

const USER_ID_MAX_LENGTH = 100;

function validateOwner(rawOwner) {
  const owner = rawOwner && rawOwner.trim();

  if (!owner || owner.length === 0) {
    throw new ServiceError('UNAUTHORIZED', 'Usuário não autenticado. Informe o cabeçalho X-User-Id.', 401);
  }

  if (owner.length > USER_ID_MAX_LENGTH) {
    throw new ServiceError(
      'INVALID_USER_ID',
      'O identificador do usuário deve ter no máximo 100 caracteres.',
      400,
    );
  }

  return owner;
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
  validateOwner,
  ensureSafeStoragePath,
  validateDocumentId,
};
