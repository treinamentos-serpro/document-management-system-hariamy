// Service: regras de negócio, autorização por proprietário e orquestração das operações.

const crypto = require('crypto');
const fs = require('fs');
const documentRepository = require('../repositories/documentRepository');

const USER_ID_MAX_LENGTH = 100;

class ServiceError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

function validateOwner(rawOwner) {
  const owner = rawOwner && rawOwner.trim().length > 0 ? rawOwner.trim() : 'anonymous';
  if (owner.length > USER_ID_MAX_LENGTH) {
    throw new ServiceError(
      'INVALID_USER_ID',
      'O identificador do usuário deve ter no máximo 100 caracteres.',
      400,
    );
  }
  return owner;
}

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

  const document = {
    id: `doc_${crypto.randomUUID()}`,
    originalName: file.originalname,
    storedName: file.filename,
    size: file.size,
    mimeType: file.mimetype,
    uploadedAt: new Date().toISOString(),
    owner: validatedOwner,
    path: file.path,
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
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new ServiceError('INVALID_DOCUMENT_ID', 'O identificador do documento é inválido.', 400);
  }

  const document = documentRepository.findById(id);
  if (!document) {
    throw new ServiceError('DOCUMENT_NOT_FOUND', 'Documento não encontrado.', 404);
  }
  if (document.owner !== validatedOwner) {
    throw new ServiceError('DOCUMENT_ACCESS_DENIED', 'Você não tem acesso a este documento.', 403);
  }
  if (!fs.existsSync(document.path)) {
    throw new ServiceError('FILE_NOT_FOUND', 'Arquivo físico não encontrado.', 404);
  }

  return document;
}

module.exports = {
  ServiceError,
  registerUpload,
  listDocuments,
  getDownloadableDocument,
};
