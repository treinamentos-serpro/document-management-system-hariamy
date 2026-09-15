const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const { STORAGE_DIR, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } = require('../config');

function createUploadMiddleware() {
  const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, STORAGE_DIR);
    },
    filename: (_req, file, callback) => {
      callback(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
    },
  });

  const fileFilter = (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      const error = new Error('Tipo de arquivo não permitido.');
      error.code = 'UNSUPPORTED_MEDIA_TYPE';
      return callback(error, false);
    }

    callback(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
  });
}

module.exports = {
  createUploadMiddleware,
};
