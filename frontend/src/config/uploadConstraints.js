export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/png',
  'image/jpeg',
];

export const FILE_INPUT_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.txt,image/png,image/jpeg';
export const ACCEPTED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.png', '.jpg', '.jpeg'];

export const UPLOAD_CONSTRAINTS_HELP_TEXT =
  'Formatos permitidos: PDF, Word, Excel, TXT, PNG e JPG. Tamanho máximo: 10 MB.';

export function isAcceptedUploadFile(file) {
  if (!file) {
    return false;
  }

  if (file.type && ACCEPTED_FILE_TYPES.includes(file.type)) {
    return true;
  }

  const lowerCaseName = file.name?.toLowerCase() || '';
  return ACCEPTED_FILE_EXTENSIONS.some((extension) => lowerCaseName.endsWith(extension));
}
