import { useState } from 'react';
import { downloadDocument } from '../services/documentsApi';

export default function DownloadButton({ document, token }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleClick() {
    setIsDownloading(true);
    setErrorMessage('');
    try {
      await downloadDocument(document.id, token, document.originalName);
    } catch (error) {
      setErrorMessage(error.message || 'Não foi possível baixar o documento.');
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="download-cell">
      <button type="button" className="btn-secondary" onClick={handleClick} disabled={isDownloading}>
        {isDownloading ? 'Baixando...' : '⬇️ Baixar'}
      </button>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}
