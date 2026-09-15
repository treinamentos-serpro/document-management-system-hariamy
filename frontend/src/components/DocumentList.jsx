import DownloadButton from './DownloadButton';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('pt-BR');
}

export default function DocumentList({ documents, token, isLoading }) {
  if (isLoading) {
    return <p className="info-message">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p className="info-message">🌷 Nenhum documento enviado ainda.</p>;
  }

  return (
    <ul className="document-list">
      {documents.map((document) => (
        <li key={document.id} className="document-item">
          <div className="document-info">
            <span className="document-name">📄 {document.originalName}</span>
            <span className="document-meta">
              {formatSize(document.size)} • {formatDate(document.uploadedAt)}
            </span>
          </div>
          <DownloadButton document={document} token={token} />
        </li>
      ))}
    </ul>
  );
}
