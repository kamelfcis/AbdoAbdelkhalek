import { apiFetch, getAccessToken, refreshAccessToken, setAccessToken, API_BASE } from './apiClient';
import { mediaUrl } from '../lib/cdn';
import {
  PROXY_MAX_BYTES,
  resolveUploadMethod,
  proxySizeErrorMessage,
} from './uploadStrategy';

export { PROXY_MAX_BYTES, resolveUploadMethod };
export type UploadMethod = 'proxy' | 'presign';

type UploadProgressHandler = (pct: number) => void;

type UploadFileOptions = {
  bucket: string;
  path: string;
  file: File;
  onProgress?: UploadProgressHandler;
};

function shouldUploadViaApi(): boolean {
  if (process.env.REACT_APP_UPLOAD_VIA_API === 'true') return true;
  if (process.env.REACT_APP_UPLOAD_VIA_API === 'false') return false;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1';
  }
  return false;
}

function xhrPut(url: string, file: File, onProgress?: UploadProgressHandler): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject(new Error(`Upload failed: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(file);
  });
}

function xhrPost(
  url: string,
  formData: FormData,
  headers: Record<string, string>,
  onProgress?: UploadProgressHandler
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.withCredentials = true;
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }
    xhr.onload = () => resolve({ status: xhr.status, body: xhr.responseText });
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

async function uploadViaProxy({ bucket, path, file, onProgress }: UploadFileOptions) {
  if (file.size > PROXY_MAX_BYTES) {
    throw new Error(proxySizeErrorMessage(file.size));
  }

  const doRequest = async (retry = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('path', path);

    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const { status, body } = await xhrPost(`${API_BASE}/uploads/proxy`, formData, headers, onProgress);

    let data: { error?: string } = {};
    try {
      data = JSON.parse(body);
    } catch {
      data = {};
    }

    if (status === 401 && !retry) {
      try {
        const newToken = await refreshAccessToken();
        setAccessToken(newToken);
        return doRequest(true);
      } catch {
        setAccessToken(null);
      }
    }

    if (!status || status < 200 || status >= 300) {
      if (status === 413) {
        throw new Error(proxySizeErrorMessage(file.size));
      }
      throw new Error(data.error || `Upload failed: ${status}`);
    }

    return data;
  };

  return doRequest();
}

async function uploadViaPresign({ bucket, path, file, onProgress }: UploadFileOptions) {
  const contentType = file.type || 'application/octet-stream';
  const { uploadUrl, publicUrl, key } = await apiFetch<{
    uploadUrl: string;
    publicUrl: string;
    key: string;
  }>('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({ bucket, path, contentType }),
  });

  await xhrPut(uploadUrl, file, onProgress);

  return {
    publicUrl,
    key,
    path: key.replace(`${bucket}/`, ''),
  };
}

export const uploadService = {
  async uploadFile({ bucket, path, file, onProgress }: UploadFileOptions) {
    const method = resolveUploadMethod(file.size, shouldUploadViaApi());
    if (method === 'proxy') {
      return uploadViaProxy({ bucket, path, file, onProgress });
    }
    return uploadViaPresign({ bucket, path, file, onProgress });
  },

  getPublicUrl(bucket: string, filePath: string) {
    return { data: { publicUrl: mediaUrl(bucket, filePath) } };
  },
};
