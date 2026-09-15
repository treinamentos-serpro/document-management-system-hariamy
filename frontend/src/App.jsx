import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { login } from './services/authApi';
import { fetchDocuments } from './services/documentsApi';
import './App.css';

const DEFAULT_CREDENTIALS = {
  userId: 'alice',
  password: 'alice123',
};

export default function App() {
  const [credentials, setCredentials] = useState(DEFAULT_CREDENTIALS);
  const [session, setSession] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');
  const [documentsErrorMessage, setDocumentsErrorMessage] = useState('');

  const token = session?.token || '';

  const loadDocuments = useCallback(async (currentToken) => {
    if (!currentToken) {
      setDocuments([]);
      setDocumentsErrorMessage('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setDocumentsErrorMessage('');

    try {
      const result = await fetchDocuments(currentToken);
      setDocuments(result);
    } catch (error) {
      setDocumentsErrorMessage(error.message || 'Não foi possível carregar os documentos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments(token);
  }, [token, loadDocuments]);

  async function handleLogin(event) {
    event.preventDefault();
    setIsAuthenticating(true);
    setAuthErrorMessage('');

    try {
      const nextSession = await login(credentials.userId.trim(), credentials.password);
      setSession(nextSession);
    } catch (error) {
      setSession(null);
      setDocuments([]);
      setAuthErrorMessage(error.message || 'Não foi possível autenticar.');
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handleLogout() {
    setSession(null);
    setDocuments([]);
    setAuthErrorMessage('');
    setDocumentsErrorMessage('');
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>🌸 Document Management System</h1>
        <p>Envie, consulte e baixe seus documentos com carinho.</p>
      </header>

      <section className="auth-card">
        <h2>🔐 Acesso</h2>
        {session ? (
          <div className="auth-session">
            <p>
              Logado como <strong>{session.user.id}</strong>.
            </p>
            <button type="button" className="btn-secondary" onClick={handleLogout}>
              Sair
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleLogin}>
            <label htmlFor="user-id">Usuário</label>
            <input
              id="user-id"
              type="text"
              value={credentials.userId}
              onChange={(event) => setCredentials((current) => ({ ...current, userId: event.target.value }))}
              maxLength={100}
              autoComplete="username"
            />

            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
              autoComplete="current-password"
            />

            <button type="submit" className="btn-primary" disabled={isAuthenticating}>
              {isAuthenticating ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}
        <p className="help-text">Credenciais locais padrão: alice / alice123 e bob / bob123.</p>
        {authErrorMessage && <p className="error-message">{authErrorMessage}</p>}
      </section>

      {session && <UploadComponent token={token} onUploadSuccess={() => loadDocuments(token)} />}

      <section className="documents-card">
        <h2>🌼 Meus documentos</h2>
        {session ? (
          <>
            {documentsErrorMessage && <p className="error-message">{documentsErrorMessage}</p>}
            <DocumentList documents={documents} token={token} isLoading={isLoading} />
          </>
        ) : (
          <p className="info-message">Faça login para visualizar apenas os seus documentos.</p>
        )}
      </section>
    </main>
  );
}
