# Especificação - Document Management System

## 1. Objetivo

Disponibilizar uma aplicação web para que usuários autenticados possam enviar, consultar e baixar documentos armazenados localmente, mantendo os arquivos no filesystem da aplicação e os metadados em memória.

## 2. Escopo

### 2.1 Dentro do escopo

- Upload de um documento por requisição.
- Armazenamento local dos arquivos em `backend/storage`.
- Geração de identificador único para cada documento.
- Registro em memória dos metadados do documento.
- Listagem dos documentos disponíveis para o usuário autenticado.
- Download de um documento pelo identificador.
- Autenticação local com JWT.
- Controle de acesso para que cada usuário veja apenas seus próprios documentos.
- Interface React para login, upload, listagem e download.
- API HTTP REST consumida pelo frontend por meio do prefixo `/api`.
- Endpoint de saúde do backend.
- Tratamento de erros de entrada, autenticação, arquivos inexistentes e documentos não encontrados.
- Configuração por variáveis de ambiente.

### 2.2 Fora do escopo

- Armazenamento em nuvem, banco de dados ou provedores externos.
- Persistência dos metadados após o processo ser reiniciado.
- Cadastro dinâmico de usuários.
- Versionamento de documentos.
- Edição do conteúdo de documentos.
- Exclusão de documentos.
- Compartilhamento entre usuários.
- Pastas, tags ou classificação avançada.
- Busca textual no conteúdo dos arquivos.
- Conversão ou visualização online de documentos.
- Upload de múltiplos arquivos na mesma requisição.
- Processamento assíncrono ou fila de uploads.
- Auditoria persistente de operações.

## 3. Usuários e premissas

O usuário deve se autenticar no endpoint `POST /api/auth/login` com `userId` e `password`. O backend retorna um JWT assinado localmente; o token deve ser enviado no cabeçalho `Authorization` das rotas protegidas. O identificador do usuário deve ser uma string não vazia com no máximo 100 caracteres.

Cada requisição de upload deve conter exatamente um arquivo no campo multipart `file`. O nome físico armazenado será gerado pelo sistema e o cliente não controla o caminho de armazenamento. O tamanho máximo será configurável por variável de ambiente.

## 4. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode se autenticar localmente com `userId` e `password`. |
| RF-02 | O sistema deve retornar um JWT quando as credenciais forem válidas. |
| RF-03 | O usuário pode enviar um documento usando `multipart/form-data`. |
| RF-04 | O sistema deve exigir o campo de arquivo `file` no upload. |
| RF-05 | O sistema deve gerar um identificador único para cada documento recebido. |
| RF-06 | O sistema deve armazenar o arquivo em `backend/storage` usando `multer` com `diskStorage`. |
| RF-07 | O sistema deve registrar em memória os metadados do documento após o upload. |
| RF-08 | O sistema deve associar o documento ao usuário autenticado pelo JWT. |
| RF-09 | O usuário pode listar apenas os documentos associados à sua identidade autenticada. |
| RF-10 | O sistema deve retornar a lista de documentos em formato JSON. |
| RF-11 | O usuário pode baixar um documento usando seu identificador. |
| RF-12 | O sistema deve retornar o conteúdo binário do arquivo no download. |
| RF-13 | O sistema deve informar o nome original do arquivo nos cabeçalhos HTTP apropriados. |
| RF-14 | O sistema deve retornar erro quando o documento solicitado não existir. |
| RF-15 | O sistema deve impedir acesso a documentos pertencentes a outro usuário. |
| RF-16 | O sistema deve rejeitar requisições de upload sem arquivo. |
| RF-17 | O sistema deve rejeitar arquivos acima do limite configurado. |
| RF-18 | O frontend deve permitir autenticação, seleção de arquivo e envio. |
| RF-19 | O frontend deve exibir o estado de carregamento durante login, upload e listagem. |
| RF-20 | O frontend deve exibir mensagens de erro para falhas de comunicação, autenticação ou validação. |
| RF-21 | O frontend deve atualizar a listagem após um upload realizado com sucesso. |
| RF-22 | O frontend deve apresentar uma ação de download para cada documento listado. |
| RF-23 | O backend deve disponibilizar um endpoint de verificação de saúde. |

## 5. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend deve utilizar Node.js, Express e CommonJS. |
| RNF-02 | O frontend deve utilizar React, Vite e módulos ES. |
| RNF-03 | O upload deve utilizar `multer` com `diskStorage`. |
| RNF-04 | Os arquivos devem ser armazenados exclusivamente no filesystem local em `backend/storage`. |
| RNF-05 | Os metadados devem permanecer em memória durante o ciclo de vida do processo. |
| RNF-06 | O sistema não deve depender de serviços externos de armazenamento. |
| RNF-07 | A autenticação deve ser local, com JWT assinado pelo backend, sem provedores externos de identidade. |
| RNF-08 | As configurações devem ser fornecidas por variáveis de ambiente, conforme o princípio 12-Factor. |
| RNF-09 | As camadas devem respeitar o fluxo `routes -> controllers -> services -> repositories`. |
| RNF-10 | Controllers não devem conter regras de persistência ou regras de negócio complexas. |
| RNF-11 | Repositories não devem conhecer detalhes de HTTP. |
| RNF-12 | O frontend deve acessar a API usando `fetch` e o prefixo `/api`. |
| RNF-13 | Os endpoints devem retornar JSON para respostas de sucesso e erro, exceto downloads. |
| RNF-14 | O sistema deve evitar exposição de caminhos físicos do servidor nas respostas HTTP. |
| RNF-15 | O sistema deve usar identificadores não previsíveis para os documentos. |
| RNF-16 | O código deve manter mensagens ao usuário e comentários em português, com símbolos em inglês. |
| RNF-17 | O comportamento deve ser coberto por testes automatizados do backend usando `node:test`. |
| RNF-18 | O frontend deve ser compilável com o comando definido no `package.json`. |

## 6. Configuração

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `PORT` | Não | `3000` | Porta HTTP do backend. |
| `STORAGE_DIR` | Não | `backend/storage` | Diretório de armazenamento dos arquivos. |
| `MAX_FILE_SIZE_BYTES` | Não | `10485760` | Tamanho máximo do arquivo em bytes. |
| `JWT_SECRET` | Não | `dms-local-development-secret` | Chave usada para assinar os JWTs locais. |
| `JWT_EXPIRES_IN` | Não | `1h` | Tempo de expiração dos JWTs. |
| `AUTH_USERS_JSON` | Não | usuários locais padrão | Array JSON com credenciais locais. |

A configuração deve ser carregada na inicialização da aplicação. O diretório de armazenamento deve ser criado caso não exista.

## 7. Modelo de dados

### 7.1 Documento

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | `string` | Sim | Identificador único e não previsível do documento. |
| `originalName` | `string` | Sim | Nome original fornecido pelo cliente. |
| `storedName` | `string` | Sim | Nome físico gerado pelo sistema; não é exposto ao frontend. |
| `size` | `number` | Sim | Tamanho do arquivo em bytes. |
| `mimeType` | `string` | Sim | Tipo MIME informado pelo upload. |
| `uploadedAt` | `string` | Sim | Data e hora do upload em ISO 8601. |
| `owner` | `string` | Sim | Identificador lógico do usuário dono. |
| `path` | `string` | Interno | Caminho físico controlado pelo repository. |

### 7.2 Representação pública

```json
{
  "id": "doc_01JEXAMPLE",
  "originalName": "relatorio.pdf",
  "size": 245760,
  "mimeType": "application/pdf",
  "uploadedAt": "2026-09-15T12:00:00.000Z",
  "owner": "user-123"
}
```

`storedName` e o caminho físico não fazem parte da representação pública.

## 8. Contratos de API

### 8.1 `GET /health`

Resposta `200 OK`:

```json
{
  "status": "ok"
}
```

### 8.2 `POST /api/auth/login`

Corpo:

```json
{
  "userId": "alice",
  "password": "alice123"
}
```

Resposta `200 OK`:

```json
{
  "token": "jwt-assinado",
  "user": {
    "id": "alice"
  }
}
```

Erros: `400 INVALID_LOGIN`, `401 INVALID_CREDENTIALS` e `500 AUTHENTICATION_FAILED`.

### 8.3 `POST /api/upload`

Headers: `Authorization` com o JWT do usuário autenticado e `Content-Type: multipart/form-data`.

Corpo: um arquivo no campo multipart `file`.

Resposta `201 Created`:

```json
{
  "id": "doc_01JEXAMPLE",
  "originalName": "relatorio.pdf",
  "size": 245760,
  "mimeType": "application/pdf",
  "uploadedAt": "2026-09-15T12:00:00.000Z",
  "owner": "alice"
}
```

Erros: `401 UNAUTHORIZED`, `400 FILE_REQUIRED`, `400 INVALID_USER_ID`, `413 FILE_TOO_LARGE`, `415 UNSUPPORTED_MEDIA_TYPE` e `500 UPLOAD_FAILED`.

### 8.4 `GET /api/documents`

Headers: `Authorization` com o JWT do usuário autenticado.

Resposta `200 OK`:

```json
{
  "documents": [
    {
      "id": "doc_01JEXAMPLE",
      "originalName": "relatorio.pdf",
      "size": 245760,
      "mimeType": "application/pdf",
      "uploadedAt": "2026-09-15T12:00:00.000Z",
      "owner": "alice"
    }
  ]
}
```

Regras: retornar somente documentos do usuário autenticado, lista vazia quando necessário e ordenação por `uploadedAt` decrescente. Erros: `401 UNAUTHORIZED`, `400 INVALID_USER_ID` e `500 DOCUMENT_LIST_FAILED`.

### 8.5 `GET /api/documents/:id/download`

Headers: `Authorization` com o JWT do usuário autenticado.

Resposta `200 OK`: corpo binário do arquivo, `Content-Type` igual ao MIME armazenado, `Content-Disposition` com o nome original sanitizado e `Content-Length` quando disponível.

Erros: `401 UNAUTHORIZED`, `400 INVALID_DOCUMENT_ID`, `403 DOCUMENT_ACCESS_DENIED`, `404 DOCUMENT_NOT_FOUND`, `404 FILE_NOT_FOUND` e `500 DOWNLOAD_FAILED`.

### 8.6 Formato de erro

```json
{
  "error": {
    "code": "FILE_REQUIRED",
    "message": "Um arquivo deve ser enviado no campo file."
  }
}
```

## 9. Decisões arquiteturais

### 9.1 Backend

O backend seguirá a Clean Architecture simples:

```text
routes -> controllers -> services -> repositories
```

- `routes/`: registra endpoints e middlewares; não contém regras de negócio.
- `controllers/`: lê entrada HTTP, chama services e monta respostas; não manipula diretamente o filesystem.
- `services/`: concentra autenticação, autorização por proprietário e orquestração das operações.
- `repositories/`: persistem arquivos no filesystem local e mantêm os metadados em memória; não conhecem Express ou HTTP.

### 9.2 Frontend

O frontend seguirá a organização `components/`, `pages/` e `services/`. O serviço encapsulará as chamadas `fetch` pelo prefixo `/api`; os componentes tratarão login, upload, listagem, estados de carregamento, erros e download; `App.jsx` fará a composição da página principal.

## 10. Fluxos principais

### 10.1 Login

1. O usuário informa `userId` e `password`.
2. O frontend envia `POST /api/auth/login`.
3. O backend valida as credenciais locais configuradas por variável de ambiente.
4. O backend assina um JWT local e o retorna ao frontend.

### 10.2 Upload

1. O usuário seleciona um arquivo.
2. O frontend envia `POST /api/upload` com `FormData` e o JWT no cabeçalho `Authorization`.
3. O middleware autentica o usuário.
4. O multer grava o arquivo no diretório local configurado.
5. O service gera o identificador e monta os metadados.
6. O repository registra o documento em memória.
7. O backend retorna `201 Created`.
8. O frontend atualiza a listagem.

### 10.3 Listagem

1. O frontend solicita `GET /api/documents` com o JWT.
2. O backend autentica o usuário.
3. O service consulta os documentos do usuário.
4. O controller retorna a lista pública de metadados.

### 10.4 Download

1. O usuário aciona o download.
2. O frontend solicita `GET /api/documents/:id/download` com o JWT.
3. O backend autentica o usuário e localiza os metadados.
4. O service verifica o proprietário.
5. O controller configura os cabeçalhos e transmite o conteúdo binário.

## 11. Riscos e decisões

| Item | Decisão ou risco | Mitigação |
| --- | --- | --- |
| Metadados em memória | São perdidos quando o processo reinicia. | Documentar a limitação e deixar persistência para uma etapa futura. |
| Arquivos órfãos | Uma falha pode ocorrer após gravar o arquivo e antes do registro do metadado. | Remover o arquivo quando o registro falhar em uma evolução futura. |
| Credenciais locais | Não existe cadastro dinâmico nesta fase. | Permitir configuração por variável de ambiente sem depender de serviços externos. |
| JWT local | Requer segredo configurável. | Usar `JWT_SECRET` com possibilidade de sobrescrita por ambiente. |
| Acesso indevido | Um usuário pode tentar usar o ID de outro documento. | Validar o proprietário antes da listagem e do download. |
