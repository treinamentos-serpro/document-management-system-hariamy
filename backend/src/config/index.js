const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR || path.join(__dirname, '..', '..', 'storage'));
const MAX_FILE_SIZE_BYTES = Number(process.env.MAX_FILE_SIZE_BYTES) || 10 * 1024 * 1024;
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

module.exports = {
  PORT,
  STORAGE_DIR,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
};
