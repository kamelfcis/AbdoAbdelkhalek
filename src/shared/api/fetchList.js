import { apiFetch } from './apiClient';
import { normalizeListResponse, buildQueryString } from './listUtils';

export {
  normalizeListResponse,
  buildListApiParams,
  filtersFromCrudState,
} from './listUtils';

/** Fetch a list endpoint; returns plain array when no `limit`, paginated envelope when paginated. */
export async function fetchList(path, params, mapper) {
  const url = `${path}${buildQueryString(params)}`;
  const raw = await apiFetch(url);
  const normalized = normalizeListResponse(raw);
  const items = mapper
    ? normalized.items
        .map((row) => mapper(row))
        .filter(Boolean)
    : normalized.items;

  if (params?.limit == null) {
    return items;
  }
  return { ...normalized, items };
}
