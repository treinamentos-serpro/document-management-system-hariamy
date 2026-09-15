// Controller: lê entrada HTTP, faz validações básicas, chama services e monta respostas.

const path = require('path');
const documentService = require('../services/documentService');

function getOwner(req) {
  return req.get('X-User-Id');
}

// Retorna true e já responde a requisição se o erro for um erro de negócio conhecido.
function respondIfServiceError(res, error) {
  if (error instanceof documentService.ServiceError) {
    res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
    return true;
  }
  return false;
}

function uploadDocument(req, res) {
  try {
    const document = documentService.registerUpload({ file: req.file, owner: getOwner(req) });
    res.status(201).json(document);
  } catch (error) {
    if (respondIfServiceError(res, error)) return;
    res.status(500).json({
      error: { code: 'UPLOAD_FAILED', message: 'Falha ao processar o upload do documento.' },
    });
  }
}

function listDocuments(req, res) {
  try {
    const documents = documentService.listDocuments(getOwner(req));
    res.status(200).json({ documents });
  } catch (error) {
    if (respondIfServiceError(res, error)) return;
    res.status(500).json({
      error: { code: 'DOCUMENT_LIST_FAILED', message: 'Falha ao listar os documentos.' },
    });
  }
}

function downloadDocument(req, res) {
  try {
    const document = documentService.getDownloadableDocument({
      id: req.params.id,
      owner: getOwner(req),
    });

    // Nome sanitizado para evitar quebra de cabeçalho ou exposição de caminho físico.
    const safeName = path.basename(document.originalName).replace(/["\r\n]/g, '');
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);

    res.sendFile(path.resolve(document.path), (error) => {
      if (error && !res.headersSent) {
        res.status(500).json({
          error: { code: 'DOWNLOAD_FAILED', message: 'Falha ao baixar o documento.' },
        });
      }
    });
  } catch (error) {
    if (respondIfServiceError(res, error)) return;
    res.status(500).json({
      error: { code: 'DOWNLOAD_FAILED', message: 'Falha ao baixar o documento.' },
    });
  }
}

module.exports = {
  uploadDocument,
  listDocuments,
  downloadDocument,
};
