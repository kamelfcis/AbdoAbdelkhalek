import { apiFetch } from './apiClient';

function apiPrefix(domain) {
  return domain === 'squash' ? '/squash' : '';
}

export async function getLandingSections(domain) {
  return apiFetch(`${apiPrefix(domain)}/landing-sections`);
}

export async function setLandingSectionVisible(domain, key, visible) {
  return apiFetch(`${apiPrefix(domain)}/landing-sections/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify({ visible }),
  });
}

export const landingSectionsService = {
  getLandingSections,
  setLandingSectionVisible,
};
