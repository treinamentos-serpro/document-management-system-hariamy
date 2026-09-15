# Document Management System

Aplicação web para upload, listagem e download de documentos com separação simples
por usuário.

## Stack

- Backend: Node.js + Express
- Frontend: React + Vite
- Testes backend: `node:test`

## Funcionalidades

- Envio de documentos com `multipart/form-data`
- Listagem de documentos por `X-User-Id`
- Download de documentos por identificador
- Armazenamento local em `backend/storage`
- Metadados mantidos em memória

## Como executar

### Backend

```bash
cd backend
npm install
npm start
```

O backend usa as variáveis:

- `PORT` (padrão: `3000`)
- `STORAGE_DIR` (padrão: `backend/storage`)
- `MAX_FILE_SIZE_BYTES` (padrão: `10485760`)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend consome a API pelo prefixo `/api`.

## Testes

```bash
cd backend
npm test
```

## Documentação complementar

- Especificação funcional: `docs/specs/dms-spec.md`
