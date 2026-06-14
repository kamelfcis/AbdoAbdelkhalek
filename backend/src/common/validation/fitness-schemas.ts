import { z } from 'zod';
import { bodyWithAliases } from './snake-camel.js';

const optionalString = z.string().optional().nullable();
const optionalBool = z.boolean().optional();
const optionalInt = z.number().int().optional().nullable();
const optionalNumber = z.number().optional().nullable();

export const categoryCreateSchema = bodyWithAliases({
  nameEn: z.string().min(1, 'nameEn is required'),
  nameAr: z.string().min(1, 'nameAr is required'),
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  imagePath: optionalString,
  imageUrl: optionalString,
  isPublic: optionalBool,
});

export const categoryUpdateSchema = bodyWithAliases({
  nameEn: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  imagePath: optionalString,
  imageUrl: optionalString,
  isPublic: optionalBool,
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const videoCreateSchema = bodyWithAliases({
  titleEn: z.string().min(1, 'titleEn is required'),
  titleAr: z.string().min(1, 'titleAr is required'),
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  categoryId: z.string().uuid().optional().nullable(),
  videoUrl: optionalString,
  videoPath: optionalString,
  thumbnailUrl: optionalString,
  thumbnailPath: optionalString,
  durationSeconds: optionalInt,
  isPublic: optionalBool,
});

export const videoUpdateSchema = bodyWithAliases({
  titleEn: z.string().min(1).optional(),
  titleAr: z.string().min(1).optional(),
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  categoryId: z.string().uuid().optional().nullable(),
  videoUrl: optionalString,
  videoPath: optionalString,
  thumbnailUrl: optionalString,
  thumbnailPath: optionalString,
  durationSeconds: optionalInt,
  isPublic: optionalBool,
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });

const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);

const packageLevelEnum = z.enum(['beginner', 'intermediate', 'advanced', 'elite']);
const packageTypeEnum = z.enum(['training', 'nutrition', 'combined']);

const optionalFeatures = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .nullable()
  .transform((v) => {
    if (v == null || v === '') return null;
    if (Array.isArray(v)) return v.length ? v : null;
    const lines = v
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    return lines.length ? lines : null;
  });

const packagePrice = z.preprocess(
  (v) => (v === null || v === '' || v === undefined ? 0 : v),
  z.number().nonnegative()
);

export const packageCreateSchema = bodyWithAliases({
  nameEn: z.string().min(1, 'nameEn is required'),
  nameAr: z.string().min(1, 'nameAr is required'),
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  priceEgp: packagePrice,
  priceUsd: packagePrice,
  durationDays: z.preprocess(
    emptyToUndefined,
    z.number({ invalid_type_error: 'durationDays is required' }).int().min(1)
  ),
  level: z.preprocess(emptyToUndefined, packageLevelEnum.default('beginner')),
  type: z.preprocess(emptyToUndefined, packageTypeEnum.default('combined')),
  featuresEn: optionalFeatures,
  featuresAr: optionalFeatures,
  includesVideoFeedback: optionalBool,
  dailySupport: optionalBool,
  allow1Month: optionalBool,
  allow3Months: optionalBool,
  allow6Months: optionalBool,
});

export const packageUpdateSchema = bodyWithAliases({
  nameEn: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  priceEgp: z.preprocess(emptyToUndefined, optionalNumber),
  priceUsd: z.preprocess(emptyToUndefined, optionalNumber),
  durationDays: z.preprocess(emptyToUndefined, optionalInt),
  level: z.preprocess(emptyToUndefined, packageLevelEnum.optional()),
  type: z.preprocess(emptyToUndefined, packageTypeEnum.optional()),
  featuresEn: optionalFeatures,
  featuresAr: optionalFeatures,
  includesVideoFeedback: optionalBool,
  dailySupport: optionalBool,
  allow1Month: optionalBool,
  allow3Months: optionalBool,
  allow6Months: optionalBool,
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const reviewCreateSchema = bodyWithAliases({
  imageUrl: optionalString,
  imagePath: optionalString,
  displayOrder: optionalInt,
  isPublic: optionalBool,
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field required (e.g. imageUrl, imagePath)',
});

export const reviewUpdateSchema = bodyWithAliases({
  imageUrl: optionalString,
  imagePath: optionalString,
  displayOrder: optionalInt,
  isPublic: optionalBool,
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const successStoryCreateSchema = bodyWithAliases({
  titleEn: optionalString,
  titleAr: optionalString,
  contentEn: optionalString,
  contentAr: optionalString,
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  beforeImagePath: optionalString,
  beforeImageUrl: optionalString,
  afterImagePath: optionalString,
  afterImageUrl: optionalString,
  imageUrl: optionalString,
  imagePath: optionalString,
  isPublic: optionalBool,
  isFeatured: optionalBool,
  displayOrder: optionalInt,
  publishedAt: optionalString,
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field required',
});

export const successStoryUpdateSchema = bodyWithAliases({
  titleEn: optionalString,
  titleAr: optionalString,
  contentEn: optionalString,
  contentAr: optionalString,
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  beforeImagePath: optionalString,
  beforeImageUrl: optionalString,
  afterImagePath: optionalString,
  afterImageUrl: optionalString,
  imageUrl: optionalString,
  imagePath: optionalString,
  isPublic: optionalBool,
  isFeatured: optionalBool,
  displayOrder: optionalInt,
  publishedAt: optionalString,
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const faqCreateSchema = bodyWithAliases({
  questionEn: z.string().min(1, 'questionEn is required'),
  questionAr: z.string().min(1, 'questionAr is required'),
  answerEn: z.string().min(1, 'answerEn is required'),
  answerAr: z.string().min(1, 'answerAr is required'),
  orderIndex: optionalInt,
  isActive: optionalBool,
});

export const faqUpdateSchema = bodyWithAliases({
  questionEn: z.string().min(1).optional(),
  questionAr: z.string().min(1).optional(),
  answerEn: z.string().min(1).optional(),
  answerAr: z.string().min(1).optional(),
  orderIndex: optionalInt,
  isActive: optionalBool,
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const faqBulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

const subscriptionStatusValues = ['active', 'paused', 'cancelled', 'expired'] as const;

export const subscriptionCreateSchema = bodyWithAliases({
  userId: z.string().uuid('userId is required'),
  packageId: z.string().uuid().optional().nullable(),
  status: z.enum(subscriptionStatusValues).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  durationMonths: z.number().int().min(1).max(12).optional(),
  paymentReference: optionalString,
});

export const subscriptionUpdateSchema = bodyWithAliases({
  userId: z.string().uuid().optional(),
  packageId: z.string().uuid().optional().nullable(),
  status: z.enum(subscriptionStatusValues).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  durationMonths: z.number().int().min(1).max(12).optional(),
  paymentReference: optionalString,
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const videoAccessSchema = z.object({
  userIds: z.array(z.string().uuid()).default([]),
});

export const traineeAccessSchema = z.object({
  categoryIds: z.array(z.string().uuid()).default([]),
  videoIds: z.array(z.string().uuid()).default([]),
});
