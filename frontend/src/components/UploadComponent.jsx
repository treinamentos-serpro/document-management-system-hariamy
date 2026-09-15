import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentsApi';

export default function UploadComponent({ ownerId, onUploadSuccess }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setErrorMessage('Selecione um arquivo antes de enviar.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    try {
      await uploadDocument(file, ownerId);
      fileInputRef.current.value = '';
      onUploadSuccess();
    } catch (error) {
      setErrorMessage(error.message || 'Não foi possível enviar o documento.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-card" onSubmit={handleSubmit}>
      <h2>🌸 Enviar novo documento</h2>
      <div className="upload-controls">
        <input type="file" ref={fileInputRef} className="upload-input" disabled={isUploading} />
        <button type="submit" className="btn-primary" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </form>
  );
}
