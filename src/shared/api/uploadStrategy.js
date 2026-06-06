/** Vercel serverless request body limit is ~4.5 MB; keep proxy uploads under that. */
export const PROXY_MAX_BYTES = 4 * 1024 * 1024;

/** @typedef {'proxy' | 'presign'} UploadMethod */

/**
 * @param {number} fileSize
 * @param {boolean} uploadViaApi
 * @returns {UploadMethod}
 */
export function resolveUploadMethod(fileSize, uploadViaApi) {
  if (fileSize > PROXY_MAX_BYTES) return 'presign';
  if (uploadViaApi) return 'proxy';
  return 'presign';
}

/**
 * @param {number} bytes
 * @returns {string}
 */
export function formatUploadBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

/**
 * @param {number} fileSize
 * @returns {string}
 */
export function proxySizeErrorMessage(fileSize) {
  return (
    `File is too large (${formatUploadBytes(fileSize)}). ` +
    `Maximum for server upload is ${formatUploadBytes(PROXY_MAX_BYTES)}. ` +
    'Videos and large files are uploaded directly to storage — save and try again.'
  );
}
