# Document Management System

Aplicação web para upload, autenticação, listagem e download de documentos com separação por usuário.

## Stack

- Backend: Node.js + Express
- Frontend: React + Vite
- Testes backend: `node:test`

## Funcionalidades

- Autenticação local com JWT
- Envio de documentos com `multipart/form-data`
- Listagem apenas dos documentos do usuário autenticado
- Download de documentos por identificador com validação de propriedade
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
- `JWT_SECRET` (padrão local: `dms-local-development-secret`)
- `JWT_EXPIRES_IN` (padrão: `1h`)
- `AUTH_USERS_JSON` (opcional, array JSON com usuários locais no formato `[{"id":"alice","password":"alice123"}]`)

Sem `AUTH_USERS_JSON`, a aplicação sobe com usuários locais de demonstração:

- `alice` / `alice123`
- `bob` / `bob123`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend consome a API pelo prefixo `/api`.

## Fluxo de autenticação

1. Faça login em `POST /api/auth/login` com `userId` e `password`.
2. Use o token retornado no cabeçalho `Authorization`, com o prefixo `Bearer`.
3. As rotas `POST /api/upload`, `GET /api/documents` e `GET /api/documents/:id/download` retornam apenas dados do usuário autenticado.

## Testes

```bash
cd backend
npm test
```

## Documentação complementar

- Especificação funcional: `docs/specs/dms-spec.md`
