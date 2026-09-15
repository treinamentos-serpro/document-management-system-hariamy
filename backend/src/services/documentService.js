const crypto = require('crypto');
const fs = require('fs');
const documentRepository = require('../repositories/documentRepository');
const ServiceError = require('../errors/ServiceError');
const { validateOwner, ensureSafeStoragePath, validateDocumentId } = require('../utils/documentValidation');

function toPublicDocument(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    mimeType: document.mimeType,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
  };
}

function registerUpload({ file, owner }) {
  const validatedOwner = validateOwner(owner);
  if (!file) {
    throw new ServiceError('FILE_REQUIRED', 'Um arquivo deve ser enviado no campo file.', 400);
  }

  const resolvedPath = ensureSafeStoragePath(file.path);

  const document = {
    id: `doc_${crypto.randomUUID()}`,
    originalName: file.originalname,
    storedName: file.filename,
    size: file.size,
    mimeType: file.mimetype,
    uploadedAt: new Date().toISOString(),
    owner: validatedOwner,
    path: resolvedPath,
  };

  documentRepository.save(document);
  return toPublicDocument(document);
}

function listDocuments(owner) {
  const validatedOwner = validateOwner(owner);
  return documentRepository
    .findByOwner(validatedOwner)
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .map(toPublicDocument);
}

function getDownloadableDocument({ id, owner }) {
  const validatedOwner = validateOwner(owner);
  validateDocumentId(id);

  const document = documentRepository.findById(id);
  if (!document) {
    throw new ServiceError('DOCUMENT_NOT_FOUND', 'Documento não encontrado.', 404);
  }

  if (document.owner !== validatedOwner) {
    throw new ServiceError('DOCUMENT_ACCESS_DENIED', 'Você não tem acesso a este documento.', 403);
  }

  const safeStoragePath = ensureSafeStoragePath(document.path);
  if (!fs.existsSync(safeStoragePath)) {
    throw new ServiceError('FILE_NOT_FOUND', 'Arquivo físico não encontrado.', 404);
  }

  return { ...document, path: safeStoragePath };
}

module.exports = {
  registerUpload,
  listDocuments,
  getDownloadableDocument,
  ServiceError,
};
