# Especificação - Document Management System

## 1. Objetivo

Disponibilizar uma aplicação web para que usuários possam enviar, consultar e baixar documentos armazenados localmente, mantendo os arquivos no filesystem da aplicação e os metadados em memória.

## 2. Escopo

### 2.1 Dentro do escopo

- Upload de um documento por requisição.
- Armazenamento local dos arquivos em `backend/storage`.
- Geração de identificador único para cada documento.
- Registro em memória dos metadados do documento.
- Listagem dos documentos disponíveis para o usuário.
- Download de um documento pelo identificador.
- Identificação lógica do dono do documento.
- Interface React para upload, listagem e download.
- API HTTP REST consumida pelo frontend por meio do prefixo `/api`.
- Endpoint de saúde do backend.
- Tratamento de erros de entrada, arquivos inexistentes e documentos não encontrados.
- Configuração por variáveis de ambiente.

### 2.2 Fora do escopo

- Armazenamento em nuvem, banco de dados ou provedores externos.
- Persistência dos metadados após o processo ser reiniciado.
- Autenticação, autorização ou gerenciamento de credenciais.
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

O usuário será identificado logicamente pelo cabeçalho HTTP `X-User-Id`. Nesta primeira versão não haverá autenticação; quando o cabeçalho não for informado, será usado o valor `anonymous`. O identificador deve ser uma string não vazia com no máximo 100 caracteres.

Cada requisição de upload deve conter exatamente um arquivo no campo multipart `file`. O nome físico armazenado será gerado pelo sistema a partir do identificador do documento; o cliente não controlará o caminho de armazenamento. O tamanho máximo será configurável por variável de ambiente.

## 4. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um documento usando `multipart/form-data`. |
| RF-02 | O sistema deve exigir o campo de arquivo `file` no upload. |
| RF-03 | O sistema deve gerar um identificador único para cada documento recebido. |
| RF-04 | O sistema deve armazenar o arquivo em `backend/storage` usando `multer` com `diskStorage`. |
| RF-05 | O sistema deve registrar em memória os metadados do documento após o upload. |
| RF-06 | O sistema deve associar o documento ao usuário informado em `X-User-Id`. |
| RF-07 | O usuário pode listar os metadados dos documentos associados ao seu identificador. |
| RF-08 | O sistema deve retornar a lista de documentos em formato JSON. |
| RF-09 | O usuário pode baixar um documento usando seu identificador. |
| RF-10 | O sistema deve retornar o conteúdo binário do arquivo no download. |
| RF-11 | O sistema deve informar o nome original do arquivo nos cabeçalhos HTTP apropriados. |
| RF-12 | O sistema deve retornar erro quando o documento solicitado não existir. |
| RF-13 | O sistema deve impedir o download de um documento pertencente a outro usuário. |
| RF-14 | O sistema deve rejeitar requisições de upload sem arquivo. |
| RF-15 | O sistema deve rejeitar arquivos acima do limite configurado. |
| RF-16 | O frontend deve permitir selecionar um arquivo e iniciar o upload. |
| RF-17 | O frontend deve exibir o estado de carregamento durante o upload. |
| RF-18 | O frontend deve exibir mensagens de erro para falhas de comunicação ou validação. |
| RF-19 | O frontend deve atualizar a listagem após um upload realizado com sucesso. |
| RF-20 | O frontend deve apresentar uma ação de download para cada documento listado. |
| RF-21 | O backend deve disponibilizar um endpoint de verificação de saúde. |

## 5. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend deve utilizar Node.js, Express e CommonJS. |
| RNF-02 | O frontend deve utilizar React, Vite e módulos ES. |
| RNF-03 | O upload deve utilizar `multer` com `diskStorage`. |
| RNF-04 | Os arquivos devem ser armazenados exclusivamente no filesystem local em `backend/storage`. |
| RNF-05 | Os metadados devem permanecer em memória durante o ciclo de vida do processo. |
| RNF-06 | O sistema não deve depender de serviços externos de armazenamento. |
| RNF-07 | As configurações devem ser fornecidas por variáveis de ambiente, conforme o princípio 12-Factor. |
| RNF-08 | As camadas devem respeitar o fluxo `routes -> controllers -> services -> repositories`. |
| RNF-09 | Controllers não devem conter regras de persistência ou regras de negócio complexas. |
| RNF-10 | Repositories não devem conhecer detalhes de HTTP. |
| RNF-11 | O frontend deve acessar a API usando `fetch` e o prefixo `/api`. |
| RNF-12 | Os endpoints devem retornar JSON para respostas de sucesso e erro, exceto downloads. |
| RNF-13 | O sistema deve evitar exposição de caminhos físicos do servidor nas respostas HTTP. |
| RNF-14 | O sistema deve usar identificadores não previsíveis para os documentos. |
| RNF-15 | O código deve manter mensagens ao usuário e comentários em português, com símbolos em inglês. |
| RNF-16 | O comportamento deve ser coberto por testes automatizados do backend usando `node:test`. |
| RNF-17 | O frontend deve ser compilável com o comando definido no `package.json`. |

## 6. Configuração

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `PORT` | Não | `3000` | Porta HTTP do backend. |
| `STORAGE_DIR` | Não | `backend/storage` | Diretório de armazenamento dos arquivos. |
| `MAX_FILE_SIZE_BYTES` | Não | `10485760` | Tamanho máximo do arquivo em bytes. |
| `CORS_ORIGIN` | Não | Compatível com o ambiente local | Origem permitida para requisições do frontend. |

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

### 7.3 Armazenamento

O repository manterá um mapa em memória indexado por `id` e os arquivos físicos em `backend/storage`. O reinício do processo pode tornar os metadados indisponíveis, mesmo que os arquivos permaneçam no filesystem. A sincronização de arquivos antigos não faz parte desta versão.

## 8. Contratos de API

### 8.1 `GET /health`

Resposta `200 OK`:

```json
{
  "status": "ok"
}
```

### 8.2 `POST /api/upload`

Headers:

```http
X-User-Id: user-123
Content-Type: multipart/form-data
```

Corpo: um arquivo no campo multipart `file`.

Resposta `201 Created`:

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

Erros: `400 FILE_REQUIRED`, `400 INVALID_USER_ID`, `413 FILE_TOO_LARGE`, `415 UNSUPPORTED_MEDIA_TYPE` e `500 UPLOAD_FAILED`.

### 8.3 `GET /api/documents`

Headers:

```http
X-User-Id: user-123
```

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
      "owner": "user-123"
    }
  ]
}
```

Regras: retornar somente documentos do usuário, lista vazia quando necessário e ordenação por `uploadedAt` decrescente. Erros: `400 INVALID_USER_ID` e `500 DOCUMENT_LIST_FAILED`.

### 8.4 `GET /api/documents/:id/download`

Headers:

```http
X-User-Id: user-123
```

Resposta `200 OK`: corpo binário do arquivo, `Content-Type` igual ao MIME armazenado, `Content-Disposition` com o nome original sanitizado e `Content-Length` quando disponível.

Erros: `400 INVALID_DOCUMENT_ID`, `403 DOCUMENT_ACCESS_DENIED`, `404 DOCUMENT_NOT_FOUND`, `404 FILE_NOT_FOUND` e `500 DOWNLOAD_FAILED`.

### 8.5 Formato de erro

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

- `routes/`: registra endpoints e middleware do multer; não contém regras de negócio.
- `controllers/`: lê entrada HTTP, faz validações básicas, chama services e monta respostas; não manipula diretamente o filesystem.
- `services/`: concentra regras de negócio, autorização por proprietário e orquestração das operações.
- `repositories/`: persiste arquivos no filesystem local e mantém os metadados em memória; não conhece Express ou HTTP.

### 9.2 Frontend

O frontend seguirá a organização `components/`, `pages/` e `services/`. O serviço encapsulará as chamadas `fetch` pelo prefixo `/api`; os componentes tratarão upload, listagem, estados de carregamento, erros e download; `App.jsx` fará a composição da página principal.

Componentes previstos: `UploadComponent`, `DocumentList` e `DownloadButton`.

## 10. Fluxos principais

### 10.1 Upload

1. O usuário seleciona um arquivo.
2. O frontend envia `POST /api/upload` com `FormData`.
3. O backend identifica o usuário pelo `X-User-Id`.
4. O multer grava o arquivo no diretório local configurado.
5. O service gera o identificador e monta os metadados.
6. O repository registra o documento em memória.
7. O backend retorna `201 Created`.
8. O frontend atualiza a listagem.

### 10.2 Listagem

1. O frontend solicita `GET /api/documents`.
2. O backend identifica o usuário.
3. O service consulta os documentos do usuário.
4. O controller retorna a lista pública de metadados.
5. O frontend apresenta nome, tamanho, data e ação de download.

### 10.3 Download

1. O usuário aciona o download.
2. O frontend solicita `GET /api/documents/:id/download`.
3. O backend localiza os metadados.
4. O service verifica o proprietário.
5. O repository abre o arquivo físico.
6. O controller configura os cabeçalhos.
7. O backend transmite o conteúdo binário.

## 11. Plano de execução

### Etapa 1 - Consolidar a especificação

- Criar `docs/specs/dms-spec.md` a partir do modelo.
- Validar requisitos, contratos, arquitetura e restrição de armazenamento local.
- Critério: somente o documento de especificação é criado nesta etapa.

### Etapa 2 - Preparar configuração e aplicação backend

- Centralizar porta, diretório de storage e limite de upload.
- Criar o diretório local na inicialização.
- Preservar `/health` e preparar tratamento global de erros.
- Critério: aplicação inicia com padrões e aceita variáveis de ambiente.

### Etapa 3 - Implementar repositories

- Criar repository de metadados em memória.
- Criar repository de arquivos locais.
- Implementar gravação, leitura e verificação de arquivos sem dependência de HTTP.
- Critério: documentos podem ser registrados, filtrados por dono e lidos por ID.

### Etapa 4 - Implementar services

- Implementar upload, listagem e download.
- Gerar IDs únicos e validar propriedade do documento.
- Encapsular erros de domínio e expor somente metadados públicos.
- Critério: regras de negócio funcionam sem dependência do Express.

### Etapa 5 - Implementar controllers e rotas

- Configurar `multer.diskStorage`.
- Implementar `POST /api/upload`, `GET /api/documents` e `GET /api/documents/:id/download`.
- Padronizar respostas e erros HTTP.
- Critério: contratos de API e status definidos nesta especificação são atendidos.

### Etapa 6 - Implementar testes do backend

- Testar saúde, upload válido, arquivo ausente, limite de tamanho, listagem, isolamento entre usuários, download e documento inexistente.
- Limpar arquivos temporários dos testes.
- Critério: `npm test` passa sem armazenamento externo.

### Etapa 7 - Implementar serviço do frontend

- Encapsular upload com `FormData`, listagem e download.
- Padronizar tratamento de erros usando o prefixo `/api`.
- Critério: componentes não montam URLs nem tratam detalhes HTTP repetidamente.

### Etapa 8 - Implementar componentes e página principal

- Criar seleção e envio de arquivo.
- Exibir carregamento, sucesso, erro, estado vazio e listagem.
- Adicionar ação de download e atualizar a lista após upload.
- Critério: usuário consegue executar o fluxo completo pela interface.

### Etapa 9 - Validar integração

- Confirmar proxy do Vite para `/api`.
- Executar backend e frontend.
- Validar upload, listagem, download e falhas pelo navegador.
- Critério: frontend e backend se comunicam sem expor caminhos físicos.

### Etapa 10 - Revisão final

- Executar testes do backend e build do frontend.
- Revisar Clean Architecture, tratamento de erros e armazenamento exclusivamente local.
- Confirmar que a implementação continua alinhada a esta especificação.

## 12. Riscos e decisões

| Item | Decisão ou risco | Mitigação |
| --- | --- | --- |
| Metadados em memória | São perdidos quando o processo reinicia. | Documentar a limitação e deixar persistência para uma etapa futura. |
| Arquivos órfãos | Uma falha pode ocorrer após gravar o arquivo e antes do registro do metadado. | Remover o arquivo quando o registro falhar. |
| Identificação do usuário | `X-User-Id` não fornece autenticação real. | Tratar como identificação funcional; autenticação fica fora do escopo. |
| Nomes de arquivo | Nomes enviados podem conter caracteres problemáticos. | Usar nome físico gerado pelo sistema e sanitizar o nome no download. |
| Acesso indevido | Um usuário pode tentar usar o ID de outro documento. | Validar o proprietário antes do download. |
| Limite de upload | Arquivos grandes podem consumir recursos. | Configurar limite no multer por variável de ambiente. |
| Reinício da aplicação | Podem existir arquivos sem metadados correspondentes. | Não reconstruir metadados automaticamente nesta versão. |
| Proxy de desenvolvimento | Frontend e backend usam portas diferentes. | Configurar o proxy Vite para o prefixo `/api`. |