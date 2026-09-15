import { ApiError } from './documentsApi';

const API_BASE = '/api';

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

export async function login(userId, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, password }),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return response.json();
}
