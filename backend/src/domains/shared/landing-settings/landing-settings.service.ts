import { ValidationError } from '../../../common/errors/AppError.js';
import {
  defaultSectionsMap,
  getSectionKeys,
  type LandingDomain,
} from '../../../common/config/landing-sections.js';
import { prisma } from '../../../infrastructure/prisma/client.js';

export interface LandingSectionsResponse {
  domain: LandingDomain;
  sections: Record<string, boolean>;
}

export async function getLandingSections(domain: LandingDomain): Promise<LandingSectionsResponse> {
  const defaults = defaultSectionsMap(domain);
  const row = await prisma.landingPageSettings.findUnique({ where: { domain } });

  if (!row) {
    return { domain, sections: defaults };
  }

  const stored = (row.sections ?? {}) as Record<string, boolean>;
  return { domain, sections: { ...defaults, ...stored } };
}

export async function updateLandingSection(
  domain: LandingDomain,
  key: string,
  visible: boolean
): Promise<LandingSectionsResponse> {
  const allowed = getSectionKeys(domain);
  if (!allowed.includes(key)) {
    throw new ValidationError(`Invalid section key: ${key}`);
  }

  const current = await getLandingSections(domain);
  const sections = { ...current.sections, [key]: visible };

  await prisma.landingPageSettings.upsert({
    where: { domain },
    create: { domain, sections },
    update: { sections },
  });

  return { domain, sections };
}
