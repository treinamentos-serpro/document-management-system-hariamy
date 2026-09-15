// Cliente HTTP para a API do DMS. Todas as chamadas usam o prefixo /api
// (proxy configurado no Vite) e o token JWT do usuário autenticado.

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

async function parseErrorResponse(response) {
  try {
    const data = await response.json();
    if (data?.error) {
      return new ApiError(data.error.code, data.error.message);
    }
  } catch {
    // corpo de erro inválido: cai na mensagem genérica abaixo
  }
  return new ApiError('UNKNOWN_ERROR', 'Ocorreu um erro inesperado ao comunicar com o servidor.');
}

function buildAuthHeaders(token) {
  return { Authorization: ['Bearer', token].join(' ') };
}

export async function uploadDocument(file, token) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: formData,
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  return response.json();
}

export async function fetchDocuments(token) {
  const response = await fetch(`${API_BASE}/documents`, {
    headers: buildAuthHeaders(token),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  const data = await response.json();
  return data.documents;
}

function extractFilename(contentDisposition, fallbackName) {
  if (!contentDisposition) return fallbackName;
  const match = contentDisposition.match(/filename="?([^";]+)"?/);
  return match ? match[1] : fallbackName;
}

export async function downloadDocument(id, token, fallbackName) {
  const response = await fetch(`${API_BASE}/documents/${id}/download`, {
    headers: buildAuthHeaders(token),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  const blob = await response.blob();
  const filename = extractFilename(response.headers.get('Content-Disposition'), fallbackName);

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
