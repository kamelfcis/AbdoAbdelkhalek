import { createDomainContentService } from './createDomainContentService';
import { squashConfig } from '../../domains/squash/config';

export const squashService = createDomainContentService(squashConfig.apiPrefix);
