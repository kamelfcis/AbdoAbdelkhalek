import { contentService } from '../api/contentService';
import { squashService } from '../api/squashService';

/** Resolve API service by admin/public domain key. */
export function getContentService(domain = 'fitness') {
  return domain === 'squash' ? squashService : contentService;
}
