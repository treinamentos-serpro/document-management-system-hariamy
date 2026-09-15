import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { fetchDocuments } from './services/documentsApi';
import './App.css';

const DEFAULT_OWNER_ID = 'anonymous';

export default function App() {
  const [ownerId, setOwnerId] = useState(DEFAULT_OWNER_ID);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDocuments = useCallback(async (currentOwnerId) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = await fetchDocuments(currentOwnerId);
      setDocuments(result);
    } catch (error) {
      setErrorMessage(error.message || 'Não foi possível carregar os documentos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments(ownerId);
  }, [ownerId, loadDocuments]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>🌸 Document Management System</h1>
        <p>Envie, consulte e baixe seus documentos com carinho.</p>
      </header>

      <section className="owner-card">
        <label htmlFor="owner-id">Seu identificador de usuário</label>
        <input
          id="owner-id"
          type="text"
          value={ownerId}
          onChange={(event) => setOwnerId(event.target.value || DEFAULT_OWNER_ID)}
          maxLength={100}
        />
      </section>

      <UploadComponent ownerId={ownerId} onUploadSuccess={() => loadDocuments(ownerId)} />

      <section className="documents-card">
        <h2>🌼 Meus documentos</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <DocumentList documents={documents} ownerId={ownerId} isLoading={isLoading} />
      </section>
    </main>
  );
}
