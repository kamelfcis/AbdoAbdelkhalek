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

export const packageCreateSchema = bodyWithAliases({
  nameEn: z.string().min(1, 'nameEn is required'),
  nameAr: z.string().min(1, 'nameAr is required'),
  level: z.string().min(1).optional(),
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  price: optionalNumber,
  priceEgp: optionalNumber,
  priceUsd: optionalNumber,
  durationDays: optionalInt,
  featuresEn: optionalString,
  featuresAr: optionalString,
  isActive: optionalBool,
});

export const packageUpdateSchema = bodyWithAliases({
  nameEn: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  price: optionalNumber,
  priceEgp: optionalNumber,
  priceUsd: optionalNumber,
  durationDays: optionalInt,
  featuresEn: optionalString,
  featuresAr: optionalString,
  isActive: optionalBool,
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
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  imageUrl: optionalString,
  imagePath: optionalString,
  isPublic: optionalBool,
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field required',
});

export const successStoryUpdateSchema = bodyWithAliases({
  titleEn: optionalString,
  titleAr: optionalString,
  descriptionEn: optionalString,
  descriptionAr: optionalString,
  imageUrl: optionalString,
  imagePath: optionalString,
  isPublic: optionalBool,
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

export const subscriptionCreateSchema = bodyWithAliases({
  userId: z.string().uuid('userId is required'),
  packageId: z.string().uuid().optional().nullable(),
  status: z.string().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

export const subscriptionUpdateSchema = bodyWithAliases({
  userId: z.string().uuid().optional(),
  packageId: z.string().uuid().optional().nullable(),
  status: z.string().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const videoAccessSchema = z.object({
  userIds: z.array(z.string().uuid()).default([]),
});

export const traineeAccessSchema = z.object({
  categoryIds: z.array(z.string().uuid()).default([]),
  videoIds: z.array(z.string().uuid()).default([]),
});
