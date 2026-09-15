const { after, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-storage-'));
process.env.STORAGE_DIR = storageDir;
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.AUTH_USERS_JSON = JSON.stringify([
  { id: 'alice-upload', password: 'alice123' },
  { id: 'alice-list', password: 'alice123' },
  { id: 'alice-download', password: 'alice123' },
  { id: 'alice-private', password: 'alice123' },
  { id: 'bob-private', password: 'bob123' },
]);

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

async function loginAndGetToken(baseUrl, userId, password) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, password }),
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(body.token);
  assert.equal(body.user.id, userId);
  return body.token;
}

function buildAuthHeaders(token) {
  return { Authorization: ['Bearer', token].join(' ') };
}

async function uploadDocument(baseUrl, { token, content = 'conteudo de teste', filename = 'teste.txt' }) {
  const formData = new FormData();
  formData.set('file', new Blob([content], { type: 'text/plain' }), filename);

  return fetch(`${baseUrl}/api/upload`, {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: formData,
  });
}

test('POST /api/auth/login retorna token JWT para credenciais válidas', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'alice-upload', password: 'alice123' }),
    });

    assert.equal(response.status, 200);

    const body = await response.json();
    assert.ok(body.token);
    assert.equal(body.user.id, 'alice-upload');
  });
});

test('POST /api/auth/login rejeita credenciais inválidas', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'alice-upload', password: 'senha-incorreta' }),
    });

    assert.equal(response.status, 401);

    const body = await response.json();
    assert.equal(body.error.code, 'INVALID_CREDENTIALS');
  });
});

test('POST /api/upload salva metadados do documento enviado para o usuário autenticado', async () => {
  await withServer(async (baseUrl) => {
    const token = await loginAndGetToken(baseUrl, 'alice-upload', 'alice123');
    const response = await uploadDocument(baseUrl, {
      token,
      content: 'documento enviado',
      filename: 'contrato.txt',
    });

    assert.equal(response.status, 201);

    const document = await response.json();
    assert.match(document.id, /^doc_/);
    assert.equal(document.originalName, 'contrato.txt');
    assert.equal(document.size, Buffer.byteLength('documento enviado'));
    assert.equal(document.mimeType, 'text/plain');
    assert.equal(document.owner, 'alice-upload');
    assert.ok(Date.parse(document.uploadedAt));
  });
});

test('GET /api/documents lista apenas documentos do usuário autenticado', async () => {
  await withServer(async (baseUrl) => {
    const aliceToken = await loginAndGetToken(baseUrl, 'alice-list', 'alice123');
    const bobToken = await loginAndGetToken(baseUrl, 'bob-private', 'bob123');

    const firstUpload = await uploadDocument(baseUrl, {
      token: aliceToken,
      content: 'primeiro documento',
      filename: 'primeiro.txt',
    });
    const secondUpload = await uploadDocument(baseUrl, {
      token: aliceToken,
      content: 'segundo documento',
      filename: 'segundo.txt',
    });
    await uploadDocument(baseUrl, {
      token: bobToken,
      content: 'documento privado',
      filename: 'privado.txt',
    });

    const firstDocument = await firstUpload.json();
    const secondDocument = await secondUpload.json();

    const response = await fetch(`${baseUrl}/api/documents`, {
      headers: buildAuthHeaders(aliceToken),
    });

    assert.equal(response.status, 200);

    const body = await response.json();
    assert.deepEqual(
      body.documents.map((document) => document.id).sort(),
      [firstDocument.id, secondDocument.id].sort(),
    );
    assert.ok(body.documents.every((document) => document.owner === 'alice-list'));
  });
});

test('GET /api/documents/:id/download baixa o conteúdo do documento', async () => {
  await withServer(async (baseUrl) => {
    const token = await loginAndGetToken(baseUrl, 'alice-download', 'alice123');
    const content = 'conteudo para download';
    const uploadResponse = await uploadDocument(baseUrl, {
      token,
      content,
      filename: 'relatorio.txt',
    });
    const document = await uploadResponse.json();

    const response = await fetch(`${baseUrl}/api/documents/${document.id}/download`, {
      headers: buildAuthHeaders(token),
    });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/plain');
    assert.match(response.headers.get('content-disposition'), /attachment; filename="relatorio\.txt"/);
    assert.equal(await response.text(), content);
  });
});

test('rotas de documentos exigem autenticação JWT', async () => {
  await withServer(async (baseUrl) => {
    const ownerToken = await loginAndGetToken(baseUrl, 'alice-private', 'alice123');
    const formData = new FormData();
    formData.append('file', new Blob(['hello-world'], { type: 'text/plain' }), 'hello.txt');

    const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    const listResponse = await fetch(`${baseUrl}/api/documents`);
    const malformedHeaderResponse = await fetch(`${baseUrl}/api/documents`, {
      headers: { Authorization: 'Basic abc123' },
    });
    const uploadResult = await uploadDocument(baseUrl, {
      token: ownerToken,
      content: 'conteudo protegido',
      filename: 'protegido.txt',
    });
    const uploadedDocument = await uploadResult.json();
    const downloadResponse = await fetch(`${baseUrl}/api/documents/${uploadedDocument.id}/download`);

    assert.equal(uploadResponse.status, 401);
    assert.equal(listResponse.status, 401);
    assert.equal(malformedHeaderResponse.status, 401);
    assert.equal(downloadResponse.status, 401);
  });
});

test('rotas de documentos rejeitam token inválido', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/documents`, {
      headers: buildAuthHeaders('token-invalido'),
    });

    assert.equal(response.status, 401);

    const body = await response.json();
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });
});

test('upload rejeita tipo de arquivo não permitido', async () => {
  await withServer(async (baseUrl) => {
    const token = await loginAndGetToken(baseUrl, 'alice-private', 'alice123');
    const formData = new FormData();
    formData.append('file', new Blob(['alert(1)'], { type: 'application/javascript' }), 'danger.js');

    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: buildAuthHeaders(token),
      body: formData,
    });

    assert.equal(response.status, 415);
  });
});

test('download impede acesso ao documento de outro usuário', async () => {
  await withServer(async (baseUrl) => {
    const aliceToken = await loginAndGetToken(baseUrl, 'alice-private', 'alice123');
    const bobToken = await loginAndGetToken(baseUrl, 'bob-private', 'bob123');

    const uploadResponse = await uploadDocument(baseUrl, {
      token: aliceToken,
      content: 'documento privado',
      filename: 'privado.txt',
    });
    const document = await uploadResponse.json();

    const response = await fetch(`${baseUrl}/api/documents/${document.id}/download`, {
      headers: buildAuthHeaders(bobToken),
    });

    assert.equal(response.status, 403);

    const body = await response.json();
    assert.equal(body.error.code, 'DOCUMENT_ACCESS_DENIED');
  });
});

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.equal(typeof app, 'function', 'o app Express deve ser uma função');
});
