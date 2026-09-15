import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentsApi';
import {
  FILE_INPUT_ACCEPT,
  MAX_FILE_SIZE_BYTES,
  UPLOAD_CONSTRAINTS_HELP_TEXT,
  isAcceptedUploadFile,
} from '../config/uploadConstraints';

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

    if (!isAcceptedUploadFile(file)) {
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
          accept={FILE_INPUT_ACCEPT}
          aria-describedby="upload-constraints"
        />
        <button type="submit" className="btn-primary" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
      <p id="upload-constraints" className="help-text">
        {UPLOAD_CONSTRAINTS_HELP_TEXT}
      </p>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </form>
  );
}
