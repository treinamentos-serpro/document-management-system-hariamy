// Repository: persiste arquivos no filesystem local e mantém metadados em memória.
// Não conhece Express nem detalhes de HTTP (RNF-10).

const fs = require('fs');
const path = require('path');

const STORAGE_DIR = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.join(__dirname, '..', '..', 'storage');

fs.mkdirSync(STORAGE_DIR, { recursive: true });

// Metadados em memória; perdidos quando o processo é reiniciado (RNF-05).
const documentsById = new Map();

function save(document) {
  documentsById.set(document.id, document);
  return document;
}

function findById(id) {
  return documentsById.get(id);
}

function findByOwner(owner) {
  return Array.from(documentsById.values()).filter((document) => document.owner === owner);
}

module.exports = {
  STORAGE_DIR,
  save,
  findById,
  findByOwner,
};
