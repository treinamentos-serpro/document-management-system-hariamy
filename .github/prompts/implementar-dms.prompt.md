---
description: "Implementa uma funcionalidade ou correção no Document Management System."
name: implementar-dms
argument-hint: "Descreva a funcionalidade ou correção a entregar."
agent: dms-implementer
---

# Implementar mudança no DMS

Implemente a seguinte mudança no Document Management System:

${input:solicitacao:Descreva a funcionalidade ou correção a entregar.}

Requisitos de execução:

- Identifique os arquivos e testes mais próximos antes da primeira alteração.
- Mantenha a separação `routes -> controllers -> services -> repositories` no backend.
- Para upload, mantenha arquivos em `backend/storage` e metadados em memória.
- No frontend, use `fetch` pelo prefixo `/api` e preserve os componentes existentes.
- Faça apenas alterações necessárias para a solicitação.
- Execute o teste ou a validação mais específica disponível após a implementação.

Ao concluir, informe os arquivos alterados, o comportamento entregue e a validação executada.