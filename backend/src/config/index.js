const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR || path.join(__dirname, '..', '..', 'storage'));
const MAX_FILE_SIZE_BYTES = Number(process.env.MAX_FILE_SIZE_BYTES) || 10 * 1024 * 1024;
const JWT_SECRET = process.env.JWT_SECRET || 'dms-local-development-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const AUTH_RATE_LIMIT_WINDOW_MS = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 60 * 1000;
const AUTH_RATE_LIMIT_MAX_REQUESTS = Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 10;
const DOCUMENT_RATE_LIMIT_WINDOW_MS = Number(process.env.DOCUMENT_RATE_LIMIT_WINDOW_MS) || 60 * 1000;
const DOCUMENT_RATE_LIMIT_MAX_REQUESTS = Number(process.env.DOCUMENT_RATE_LIMIT_MAX_REQUESTS) || 120;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/png',
  'image/jpeg',
]);

function parseUsersConfig(rawUsersConfig) {
  if (!rawUsersConfig) {
    return [
      { id: 'alice', password: 'alice123' },
      { id: 'bob', password: 'bob123' },
    ];
  }

  let parsedUsers;
  try {
    parsedUsers = JSON.parse(rawUsersConfig);
  } catch (error) {
    throw new Error('AUTH_USERS_JSON inválido. Informe um array JSON de objetos com id e password.');
  }

  if (!Array.isArray(parsedUsers)) {
    throw new Error('AUTH_USERS_JSON deve ser um array JSON.');
  }

  return parsedUsers.map((user) => ({
    id: String(user?.id || '').trim(),
    password: String(user?.password || ''),
  }));
}

const AUTH_USERS = parseUsersConfig(process.env.AUTH_USERS_JSON);

module.exports = {
  PORT,
  STORAGE_DIR,
  MAX_FILE_SIZE_BYTES,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  AUTH_USERS,
  AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_RATE_LIMIT_MAX_REQUESTS,
  DOCUMENT_RATE_LIMIT_WINDOW_MS,
  DOCUMENT_RATE_LIMIT_MAX_REQUESTS,
  ALLOWED_MIME_TYPES,
};
