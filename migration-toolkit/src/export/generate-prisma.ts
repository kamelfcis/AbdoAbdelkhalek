import { readFile, writeFile, copyFile } from 'fs/promises';
import { resolve } from 'path';
import { env, paths } from '../lib/env.js';
import { ensureDir } from '../lib/fs-utils.js';
import { log } from '../lib/logger.js';

const PRISMA_TEMPLATE = `// Generated from Supabase migration — run \`npx prisma db pull\` after restore for full accuracy
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email      String   @unique
  passwordHash String? @map("password_hash")
  fullName   String?  @map("full_name")
  phone      String?
  isCoach    Boolean  @default(false) @map("is_coach")
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  videoAccess    UserVideoAccess[]
  categoryAccess UserCategoryAccess[]
  subscriptions  Subscription[]

  @@map("users")
}

model Category {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  nameEn        String   @map("name_en")
  nameAr        String   @map("name_ar")
  descriptionEn String?  @map("description_en")
  descriptionAr String?  @map("description_ar")
  imagePath     String?  @map("image_path")
  isPublic      Boolean  @default(true) @map("is_public")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  videos Video[]
  userCategoryAccess UserCategoryAccess[]

  @@map("categories")
}

model Video {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  titleEn         String    @map("title_en")
  titleAr         String    @map("title_ar")
  descriptionEn   String?   @map("description_en")
  descriptionAr   String?   @map("description_ar")
  categoryId      String?   @map("category_id") @db.Uuid
  videoUrl        String?   @map("video_url")
  videoPath       String?   @map("video_path")
  thumbnailUrl    String?   @map("thumbnail_url")
  thumbnailPath   String?   @map("thumbnail_path")
  durationSeconds Int?      @map("duration_seconds")
  isPublic        Boolean   @default(false) @map("is_public")
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  category   Category? @relation(fields: [categoryId], references: [id])
  userAccess UserVideoAccess[]

  @@map("videos")
}

model Package {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  nameEn        String   @map("name_en")
  nameAr        String   @map("name_ar")
  descriptionEn String?  @map("description_en")
  descriptionAr String?  @map("description_ar")
  price         Decimal? @db.Decimal
  durationDays  Int?     @map("duration_days")
  featuresEn    String?  @map("features_en")
  featuresAr    String?  @map("features_ar")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  subscriptions Subscription[]

  @@map("packages")
}

model Subscription {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  packageId String?  @map("package_id") @db.Uuid
  status    String?
  startDate DateTime? @map("start_date") @db.Timestamptz(6)
  endDate   DateTime? @map("end_date") @db.Timestamptz(6)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  user    User     @relation(fields: [userId], references: [id])
  package Package? @relation(fields: [packageId], references: [id])

  @@map("subscriptions")
}

model Review {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  imageUrl     String?  @map("image_url")
  imagePath    String?  @map("image_path")
  displayOrder Int      @default(0) @map("display_order")
  isPublic     Boolean  @default(true) @map("is_public")
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  @@map("reviews")
}

model SuccessStory {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  titleEn       String?  @map("title_en")
  titleAr       String?  @map("title_ar")
  descriptionEn String?  @map("description_en")
  descriptionAr String?  @map("description_ar")
  imageUrl      String?  @map("image_url")
  imagePath     String?  @map("image_path")
  isPublic      Boolean  @default(true) @map("is_public")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  @@map("success_stories")
}

model Faq {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  questionEn    String   @map("question_en")
  questionAr    String   @map("question_ar")
  answerEn      String   @map("answer_en")
  answerAr      String   @map("answer_ar")
  displayOrder  Int      @default(0) @map("display_order")
  isPublic      Boolean  @default(true) @map("is_public")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  @@map("faqs")
}

model UserVideoAccess {
  userId  String @map("user_id") @db.Uuid
  videoId String @map("video_id") @db.Uuid

  user  User  @relation(fields: [userId], references: [id])
  video Video @relation(fields: [videoId], references: [id])

  @@id([userId, videoId])
  @@map("user_video_access")
}

model UserCategoryAccess {
  userId     String @map("user_id") @db.Uuid
  categoryId String @map("category_id") @db.Uuid

  user     User     @relation(fields: [userId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])

  @@id([userId, categoryId])
  @@map("user_category_access")
}

model RefreshToken {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  tokenHash String   @map("token_hash")
  expiresAt DateTime @map("expires_at") @db.Timestamptz(6)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  @@map("refresh_tokens")
}
`;

export async function generatePrisma(): Promise<void> {
  const backendPrismaDir = resolve(env.rootDir, 'backend/prisma');
  await ensureDir(backendPrismaDir);

  const schemaBackup = resolve(paths.database, 'schema.sql');
  try {
    await copyFile(schemaBackup, resolve(paths.migration, 'schema.sql'));
    log('Copied schema.sql to migration/postgresql/');
  } catch {
    log('No backup schema.sql yet');
  }

  const outPath = resolve(backendPrismaDir, 'schema.prisma');
  await writeFile(outPath, PRISMA_TEMPLATE, 'utf8');
  log(`Generated ${outPath}`);
  log('After restore, run: cd backend && npx prisma db pull && npx prisma generate');
}
