const { after, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-storage-'));
process.env.STORAGE_DIR = storageDir;

const app = require('../src/app');

after(() => {
  fs.rmSync(storageDir, { recursive: true, force: true });
});

function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

async function withServer(runTest) {
  const server = await startServer();
  const { port } = server.address();

  try {
    await runTest(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function uploadDocument(baseUrl, { owner, content = 'conteudo de teste', filename = 'teste.txt' }) {
  const formData = new FormData();
  formData.set('file', new Blob([content], { type: 'text/plain' }), filename);

  return fetch(`${baseUrl}/api/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': owner },
    body: formData,
  });
}

test('POST /api/upload salva metadados do documento enviado', async () => {
  await withServer(async (baseUrl) => {
    const response = await uploadDocument(baseUrl, {
      owner: 'usuario-upload',
      content: 'documento enviado',
      filename: 'contrato.txt',
    });

    assert.equal(response.status, 201);

    const document = await response.json();
    assert.match(document.id, /^doc_/);
    assert.equal(document.originalName, 'contrato.txt');
    assert.equal(document.size, Buffer.byteLength('documento enviado'));
    assert.equal(document.mimeType, 'text/plain');
    assert.equal(document.owner, 'usuario-upload');
    assert.ok(Date.parse(document.uploadedAt));
  });
});

test('GET /api/documents lista apenas documentos do usuário informado', async () => {
  await withServer(async (baseUrl) => {
    const owner = 'usuario-listagem';
    const otherOwner = 'outro-usuario';

    const firstUpload = await uploadDocument(baseUrl, {
      owner,
      content: 'primeiro documento',
      filename: 'primeiro.txt',
    });
    const secondUpload = await uploadDocument(baseUrl, {
      owner,
      content: 'segundo documento',
      filename: 'segundo.txt',
    });
    await uploadDocument(baseUrl, {
      owner: otherOwner,
      content: 'documento privado',
      filename: 'privado.txt',
    });

    const firstDocument = await firstUpload.json();
    const secondDocument = await secondUpload.json();

    const response = await fetch(`${baseUrl}/api/documents`, {
      headers: { 'X-User-Id': owner },
    });

    assert.equal(response.status, 200);

    const body = await response.json();
    assert.deepEqual(
      body.documents.map((document) => document.id).sort(),
      [firstDocument.id, secondDocument.id].sort(),
    );
    assert.ok(body.documents.every((document) => document.owner === owner));
  });
});

test('GET /api/documents/:id/download baixa o conteúdo do documento', async () => {
  await withServer(async (baseUrl) => {
    const content = 'conteudo para download';
    const uploadResponse = await uploadDocument(baseUrl, {
      owner: 'usuario-download',
      content,
      filename: 'relatorio.txt',
    });
    const document = await uploadResponse.json();

    const response = await fetch(`${baseUrl}/api/documents/${document.id}/download`, {
      headers: { 'X-User-Id': 'usuario-download' },
    });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/plain');
    assert.match(response.headers.get('content-disposition'), /attachment; filename="relatorio\.txt"/);
    assert.equal(await response.text(), content);
  });
});
