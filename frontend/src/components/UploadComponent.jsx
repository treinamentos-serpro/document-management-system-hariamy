import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentsApi';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/png',
  'image/jpeg',
];

export default function UploadComponent({ ownerId, onUploadSuccess }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function validateFile(file) {
    if (!file) {
      return 'Selecione um arquivo antes de enviar.';
    }

    const trimmedOwnerId = ownerId.trim();
    if (!trimmedOwnerId) {
      return 'Informe um identificador de usuário antes de enviar o documento.';
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return 'O arquivo excede o tamanho máximo permitido de 10 MB.';
    }

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return 'Tipo de arquivo não suportado. Use PDF, Word, Excel, texto ou imagens PNG/JPG.';
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    const validationMessage = validateFile(file);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    try {
      await uploadDocument(file, ownerId.trim());
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
        <input
          type="file"
          ref={fileInputRef}
          className="upload-input"
          disabled={isUploading}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/png,image/jpeg"
        />
        <button type="submit" className="btn-primary" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </form>
  );
}
