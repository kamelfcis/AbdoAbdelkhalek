/**
 * Seed demo squash content on Supabase.
 * Run: npx tsx scripts/seed-squash.ts (from backend/)
 */
import 'dotenv/config';
import { prisma } from '../src/infrastructure/prisma/client.js';

async function main() {
  const existing = await prisma.squashCategory.count();
  if (existing > 0) {
    console.log(`Squash seed skipped — ${existing} categories already exist.`);
    return;
  }

  const cat = await prisma.squashCategory.create({
    data: {
      nameEn: 'Fundamentals',
      nameAr: 'أساسيات الإسكواش',
      descriptionEn: 'Grip, movement, and basic shots.',
      descriptionAr: 'المسكة والحركة والضربات الأساسية.',
      isPublic: true,
    },
  });

  await prisma.squashVideo.create({
    data: {
      titleEn: 'Forehand Drive Basics',
      titleAr: 'أساسيات الضربة الأمامية',
      descriptionEn: 'Learn a stable forehand drive.',
      descriptionAr: 'تعلم ضربة أمامية مستقرة.',
      categoryId: cat.id,
      isPublic: true,
      durationSeconds: 420,
    },
  });

  await prisma.squashPackage.create({
    data: {
      nameEn: 'Starter Plan',
      nameAr: 'باقة المبتدئين',
      descriptionEn: '4 weeks of guided squash training.',
      descriptionAr: '4 أسابيع تدريب إسكواش موجه.',
      durationDays: 28,
      featuresEn: 'Weekly videos, technique checklist',
      featuresAr: 'فيديوهات أسبوعية، قائمة تقنية',
      isActive: true,
    },
  });

  await prisma.squashReview.create({
    data: {
      displayOrder: 1,
      isPublic: true,
    },
  });

  await prisma.squashSuccessStory.create({
    data: {
      titleEn: 'From Beginner to Club Player',
      titleAr: 'من مبتدئ إلى لاعب نادي',
      descriptionEn: 'Improved ranking in 3 months.',
      descriptionAr: 'تحسن التصنيف خلال 3 أشهر.',
      isPublic: true,
    },
  });

  await prisma.squashFaq.create({
    data: {
      questionEn: 'Do I need my own racket?',
      questionAr: 'هل أحتاج مضربي الخاص؟',
      answerEn: 'A club racket is fine for beginners.',
      answerAr: 'مضرب النادي مناسب للمبتدئين.',
      orderIndex: 1,
      isActive: true,
    },
  });

  await prisma.squashCoach.create({
    data: {
      nameEn: 'Abdelrhman Abdelkhalek',
      nameAr: 'عبدالرحمن عبدالخالق',
      titleEn: 'Squash Coach',
      titleAr: 'مدرب إسكواش',
      bioEn: 'Competitive squash coaching for all levels.',
      bioAr: 'تدريب إسكواش تنافسي لجميع المستويات.',
      displayOrder: 1,
      isPublic: true,
    },
  });

  await prisma.squashProgram.create({
    data: {
      nameEn: 'Junior Development',
      nameAr: 'تطوير الناشئين',
      descriptionEn: 'Structured program for young athletes.',
      descriptionAr: 'برنامج منظم للرياضيين الشباب.',
      durationDays: 60,
      displayOrder: 1,
      isActive: true,
      isPublic: true,
    },
  });

  console.log('Squash demo seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
