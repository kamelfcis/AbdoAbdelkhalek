export {
  categoryCreateSchema,
  categoryUpdateSchema,
  videoCreateSchema,
  videoUpdateSchema,
  reviewCreateSchema,
  reviewUpdateSchema,
  successStoryCreateSchema,
  successStoryUpdateSchema,
  faqCreateSchema,
  faqUpdateSchema,
  faqBulkDeleteSchema,
} from './fitness-schemas.js';

import { z } from 'zod';
import { bodyWithAliases } from './snake-camel.js';

const optionalString = z.string().optional().nullable();
const optionalBool = z.boolean().optional();
const optionalInt = z.number().int().optional().nullable();
const optionalNumber = z.number().optional().nullable();

const squashFeatures = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .nullable()
  .transform((v) => {
    if (v == null || v === '') return null;
    if (Array.isArray(v)) return v.join('\n');
    return v;
  });

/** Squash packages table still uses legacy price / string features / is_active columns. */
export const packageCreateSchema = bodyWithAliases({
  nameEn: z.string().min(1, 'nameEn is required'),
  nameAr: z.string().min(1, 'nameAr is required'),
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  price: optionalNumber,
  durationDays: optionalInt,
  featuresEn: squashFeatures,
  featuresAr: squashFeatures,
  isActive: optionalBool,
});

export const packageUpdateSchema = bodyWithAliases({
  nameEn: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  price: optionalNumber,
  durationDays: optionalInt,
  featuresEn: squashFeatures,
  featuresAr: squashFeatures,
  isActive: optionalBool,
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const coachCreateSchema = bodyWithAliases({
  nameEn: z.string().min(1, 'nameEn is required'),
  nameAr: z.string().min(1, 'nameAr is required'),
  titleEn: optionalString,
  titleAr: optionalString,
  bioEn: optionalString,
  bioAr: optionalString,
  imagePath: optionalString,
  imageUrl: optionalString,
  displayOrder: optionalInt,
  isPublic: optionalBool,
});

export const coachUpdateSchema = bodyWithAliases({
  nameEn: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  titleEn: optionalString,
  titleAr: optionalString,
  bioEn: optionalString,
  bioAr: optionalString,
  imagePath: optionalString,
  imageUrl: optionalString,
  displayOrder: optionalInt,
  isPublic: optionalBool,
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const programCreateSchema = bodyWithAliases({
  nameEn: z.string().min(1, 'nameEn is required'),
  nameAr: z.string().min(1, 'nameAr is required'),
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  imagePath: optionalString,
  imageUrl: optionalString,
  price: optionalNumber,
  durationDays: optionalInt,
  featuresEn: optionalString,
  featuresAr: optionalString,
  displayOrder: optionalInt,
  isActive: optionalBool,
  isPublic: optionalBool,
});

export const programUpdateSchema = bodyWithAliases({
  nameEn: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  imagePath: optionalString,
  imageUrl: optionalString,
  price: optionalNumber,
  durationDays: optionalInt,
  featuresEn: optionalString,
  featuresAr: optionalString,
  displayOrder: optionalInt,
  isActive: optionalBool,
  isPublic: optionalBool,
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });
