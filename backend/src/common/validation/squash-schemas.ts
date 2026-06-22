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
import {
  packageCreateSchema as fitnessPackageCreateSchema,
  packageUpdateSchema as fitnessPackageUpdateSchema,
} from './fitness-schemas.js';

const optionalString = z.string().optional().nullable();
const optionalBool = z.boolean().optional();
const optionalInt = z.number().int().optional().nullable();
const optionalNumber = z.number().optional().nullable();

const squashPackageExtras = bodyWithAliases({
  isActive: optionalBool,
});

/** Squash packages mirror fitness tier pricing; adds squash-only is_active. */
export const packageCreateSchema = fitnessPackageCreateSchema.and(squashPackageExtras);
export const packageUpdateSchema = fitnessPackageUpdateSchema.and(squashPackageExtras);

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
