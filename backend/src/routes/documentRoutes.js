const express = require('express');
const multer = require('multer');
const documentController = require('../controllers/documentController');
const { createUploadMiddleware } = require('../infrastructure/fileUpload');

const upload = createUploadMiddleware();
const router = express.Router();

router.post('/upload', (req, res, next) => {
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

router.get('/documents', documentController.listDocuments);
router.get('/documents/:id/download', documentController.downloadDocument);

module.exports = router;
