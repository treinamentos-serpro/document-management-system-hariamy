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

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.equal(typeof app, 'function', 'o app Express deve ser uma função');
});

test('upload exige identificador de usuário válido', async () => {
  await withServer(async (baseUrl) => {
    const formData = new FormData();
    formData.append('file', new Blob(['hello-world'], { type: 'text/plain' }), 'hello.txt');

    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.equal(response.status, 401, 'deve exigir o cabeçalho X-User-Id');
  });
});

test('listagem de documentos exige identificador de usuário válido', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/documents`);

    assert.equal(response.status, 401, 'deve exigir o cabeçalho X-User-Id');
  });
});

test('upload rejeita tipo de arquivo não permitido', async () => {
  await withServer(async (baseUrl) => {
    const formData = new FormData();
    formData.append('file', new Blob(['alert(1)'], { type: 'application/javascript' }), 'danger.js');

    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': 'alice' },
      body: formData,
    });

    assert.equal(response.status, 415, 'deve rejeitar tipos MIME não permitidos');
  });
});

test('upload rejeita identificador de usuário maior que 100 caracteres', async () => {
  await withServer(async (baseUrl) => {
    const formData = new FormData();
    formData.append('file', new Blob(['conteudo valido'], { type: 'text/plain' }), 'valido.txt');

    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': 'a'.repeat(101) },
      body: formData,
    });

    assert.equal(response.status, 400);

    const body = await response.json();
    assert.equal(body.error.code, 'INVALID_USER_ID');
  });
});
