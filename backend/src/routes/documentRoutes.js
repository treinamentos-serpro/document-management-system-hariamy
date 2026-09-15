const express = require('express');
const multer = require('multer');
const documentController = require('../controllers/documentController');
const { DOCUMENT_RATE_LIMIT_WINDOW_MS, DOCUMENT_RATE_LIMIT_MAX_REQUESTS } = require('../config');
const { authenticate } = require('../infrastructure/authMiddleware');
const { createUploadMiddleware } = require('../infrastructure/fileUpload');
const { createRateLimit } = require('../infrastructure/rateLimitMiddleware');

const upload = createUploadMiddleware();
const router = express.Router();
const documentRateLimit = createRateLimit({
  windowMs: DOCUMENT_RATE_LIMIT_WINDOW_MS,
  maxRequests: DOCUMENT_RATE_LIMIT_MAX_REQUESTS,
});

router.post('/upload', documentRateLimit, authenticate, (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: { code: 'FILE_TOO_LARGE', message: 'O arquivo excede o tamanho máximo permitido.' },
      });
    }

    if (error && error.code === 'UNSUPPORTED_MEDIA_TYPE') {
      return res.status(415).json({
        error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Tipo de arquivo não permitido.' },
      });
    }

    if (error) return next(error);
    return documentController.uploadDocument(req, res);
  });
});

router.get('/documents', documentRateLimit, authenticate, documentController.listDocuments);
router.get('/documents/:id/download', documentRateLimit, authenticate, documentController.downloadDocument);

module.exports = router;
