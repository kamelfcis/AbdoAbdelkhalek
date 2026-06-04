export { apiFetch, getAccessToken, setAccessToken, API_BASE } from './apiClient';
export { authService } from './authService';
export { contentService } from './contentService';
export { uploadService } from './uploadService';

/** @deprecated Use authService / contentService — kept for gradual migration */
export const useApiBackend = process.env.REACT_APP_USE_API !== 'false';
