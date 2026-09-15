// Rotas: registra endpoints e middleware do multer; não contém regras de negócio.

const crypto = require('crypto');
const path = require('path');
const express = require('express');
const multer = require('multer');
const documentRepository = require('../repositories/documentRepository');
const documentController = require('../controllers/documentController');

const MAX_FILE_SIZE_BYTES = Number(process.env.MAX_FILE_SIZE_BYTES) || 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentRepository.STORAGE_DIR);
  },
  filename: (req, file, cb) => {
    // O cliente não controla o nome físico do arquivo armazenado.
    cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE_BYTES } });

const router = express.Router();

router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: { code: 'FILE_TOO_LARGE', message: 'O arquivo excede o tamanho máximo permitido.' },
      });
    }
    if (error) return next(error);
    return documentController.uploadDocument(req, res);
  });
});

router.get('/documents', documentController.listDocuments);
router.get('/documents/:id/download', documentController.downloadDocument);

module.exports = router;
