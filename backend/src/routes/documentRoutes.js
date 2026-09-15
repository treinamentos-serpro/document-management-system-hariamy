const express = require('express');
const multer = require('multer');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const documentController = require('../controllers/documentController');
const { DOCUMENT_RATE_LIMIT_WINDOW_MS, DOCUMENT_RATE_LIMIT_MAX_REQUESTS } = require('../config');
const { authenticate } = require('../infrastructure/authMiddleware');
const { createUploadMiddleware } = require('../infrastructure/fileUpload');

const upload = createUploadMiddleware();
const router = express.Router();
const documentRateLimit = rateLimit({
  windowMs: DOCUMENT_RATE_LIMIT_WINDOW_MS,
  limit: DOCUMENT_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => (req.user?.id ? `user:${req.user.id}` : ipKeyGenerator(req.ip || 'unknown')),
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Muitas requisições em sequência. Tente novamente em instantes.',
      },
    });
  },
});

router.post('/upload', authenticate, documentRateLimit, (req, res, next) => {
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

router.get('/documents', authenticate, documentRateLimit, documentController.listDocuments);
router.get('/documents/:id/download', authenticate, documentRateLimit, documentController.downloadDocument);

module.exports = router;
