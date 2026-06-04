import { apiFetch, getAccessToken, refreshAccessToken, setAccessToken, API_BASE } from './apiClient';
import { mediaUrl } from '../lib/cdn';

function shouldUploadViaApi(): boolean {
  if (process.env.REACT_APP_UPLOAD_VIA_API === 'true') return true;
  if (process.env.REACT_APP_UPLOAD_VIA_API === 'false') return false;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1';
  }
  return false;
}

async function uploadViaProxy({
  bucket,
  path,
  file,
}: {
  bucket: string;
  path: string;
  file: File;
}) {
  const doRequest = async (retry = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('path', path);

    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/uploads/proxy`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401 && !retry) {
      try {
        const newToken = await refreshAccessToken();
        setAccessToken(newToken);
        return doRequest(true);
      } catch {
        setAccessToken(null);
      }
    }

    if (!res.ok) {
      throw new Error((data as { error?: string }).error || `Upload failed: ${res.status}`);
    }
    return data;
  };

  return doRequest();
}

async function uploadViaPresign({
  bucket,
  path,
  file,
}: {
  bucket: string;
  path: string;
  file: File;
}) {
  const contentType = file.type || 'application/octet-stream';
  const { uploadUrl, publicUrl, key } = await apiFetch<{
    uploadUrl: string;
    publicUrl: string;
    key: string;
  }>('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({ bucket, path, contentType }),
  });

  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  });
  if (!putRes.ok) throw new Error(`Upload failed: ${putRes.status}`);

  return {
    publicUrl,
    key,
    path: key.replace(`${bucket}/`, ''),
  };
}

export const uploadService = {
  async uploadFile({ bucket, path, file }: { bucket: string; path: string; file: File }) {
    if (shouldUploadViaApi()) {
      return uploadViaProxy({ bucket, path, file });
    }
    return uploadViaPresign({ bucket, path, file });
  },

  getPublicUrl(bucket: string, filePath: string) {
    return { data: { publicUrl: mediaUrl(bucket, filePath) } };
  },
};
