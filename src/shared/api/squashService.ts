import { apiFetch } from './apiClient';
import { createDomainContentService } from './createDomainContentService';
import { squashConfig } from '../../domains/squash/config';

const baseService = createDomainContentService(squashConfig.apiPrefix);

export const squashService = {
  ...baseService,
  getProfileDetails: () => apiFetch(`${squashConfig.apiPrefix}/profile`),
};
