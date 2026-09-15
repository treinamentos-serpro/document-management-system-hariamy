const fs = require('fs');
const { STORAGE_DIR } = require('../config');

const storageRoot = STORAGE_DIR;
fs.mkdirSync(storageRoot, { recursive: true });

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
  STORAGE_DIR: storageRoot,
  save,
  findById,
  findByOwner,
};
