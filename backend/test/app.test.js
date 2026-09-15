const { test } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

async function withServer(testFn) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    await testFn(server.address().port);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

// Teste de fumaça do seed: garante que o app Express foi exportado.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('upload exige identificador de usuário válido', async () => {
  await withServer(async (port) => {
    const formData = new FormData();
    formData.append('file', new Blob(['hello-world'], { type: 'text/plain' }), 'hello.txt');

    const response = await fetch(`http://127.0.0.1:${port}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(response.status, 401, 'deve exigir o cabeçalho X-User-Id');
  });
});

test('listagem de documentos exige identificador de usuário válido', async () => {
  await withServer(async (port) => {
    const response = await fetch(`http://127.0.0.1:${port}/api/documents`);

    assert.strictEqual(response.status, 401, 'deve exigir o cabeçalho X-User-Id');
  });
});

test('upload rejeita tipo de arquivo não permitido', async () => {
  await withServer(async (port) => {
    const formData = new FormData();
    formData.append('file', new Blob(['alert(1)'], { type: 'application/javascript' }), 'danger.js');

    const response = await fetch(`http://127.0.0.1:${port}/api/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': 'alice' },
      body: formData,
    });

    assert.strictEqual(response.status, 415, 'deve rejeitar tipos MIME não permitidos');
  });
});
