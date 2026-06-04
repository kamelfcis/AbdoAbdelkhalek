-- Demo squash seed (idempotent: only if no categories)
INSERT INTO squash_categories (name_en, name_ar, description_en, description_ar, is_public)
SELECT 'Fundamentals', 'أساسيات الإسكواش', 'Grip, movement, and basic shots.', 'المسكة والحركة والضربات الأساسية.', true
WHERE NOT EXISTS (SELECT 1 FROM squash_categories LIMIT 1);

INSERT INTO squash_videos (title_en, title_ar, description_en, description_ar, category_id, is_public, duration_seconds)
SELECT 'Forehand Drive Basics', 'أساسيات الضربة الأمامية', 'Learn a stable forehand drive.', 'تعلم ضربة أمامية مستقرة.',
  (SELECT id FROM squash_categories ORDER BY created_at DESC LIMIT 1), true, 420
WHERE NOT EXISTS (SELECT 1 FROM squash_videos LIMIT 1);

INSERT INTO squash_packages (name_en, name_ar, description_en, description_ar, duration_days, features_en, features_ar, is_active)
SELECT 'Starter Plan', 'باقة المبتدئين', '4 weeks of guided squash training.', '4 أسابيع تدريب إسكواش موجه.', 28,
  'Weekly videos, technique checklist', 'فيديوهات أسبوعية، قائمة تقنية', true
WHERE NOT EXISTS (SELECT 1 FROM squash_packages LIMIT 1);

INSERT INTO squash_reviews (display_order, is_public)
SELECT 1, true
WHERE NOT EXISTS (SELECT 1 FROM squash_reviews LIMIT 1);

INSERT INTO squash_success_stories (title_en, title_ar, description_en, description_ar, is_public)
SELECT 'From Beginner to Club Player', 'من مبتدئ إلى لاعب نادي', 'Improved ranking in 3 months.', 'تحسن التصنيف خلال 3 أشهر.', true
WHERE NOT EXISTS (SELECT 1 FROM squash_success_stories LIMIT 1);

INSERT INTO squash_faqs (question_en, question_ar, answer_en, answer_ar, order_index, is_active)
SELECT 'Do I need my own racket?', 'هل أحتاج مضربي الخاص؟', 'A club racket is fine for beginners.', 'مضرب النادي مناسب للمبتدئين.', 1, true
WHERE NOT EXISTS (SELECT 1 FROM squash_faqs LIMIT 1);

INSERT INTO squash_coaches (name_en, name_ar, title_en, title_ar, bio_en, bio_ar, display_order, is_public)
SELECT 'Abdelrhman Abdelkhalek', 'عبدالرحمن عبدالخالق', 'Squash Coach', 'مدرب إسكواش',
  'Competitive squash coaching for all levels.', 'تدريب إسكواش تنافسي لجميع المستويات.', 1, true
WHERE NOT EXISTS (SELECT 1 FROM squash_coaches LIMIT 1);

INSERT INTO squash_programs (name_en, name_ar, description_en, description_ar, duration_days, display_order, is_active, is_public)
SELECT 'Junior Development', 'تطوير الناشئين', 'Structured program for young athletes.', 'برنامج منظم للرياضيين الشباب.', 60, 1, true, true
WHERE NOT EXISTS (SELECT 1 FROM squash_programs LIMIT 1);
