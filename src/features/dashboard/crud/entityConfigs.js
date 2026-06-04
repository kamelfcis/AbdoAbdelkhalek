/** Entity-driven CRUD configs for fitness + squash admin. */

import { getMediaBuckets } from '../../../shared/lib/mediaBuckets';

const bilingualName = [
  { name: 'name_en', type: 'text', required: true, labelEn: 'Name (EN)', labelAr: 'الاسم (إنجليزي)' },
  { name: 'name_ar', type: 'text', required: true, labelEn: 'Name (AR)', labelAr: 'الاسم (عربي)' },
];

const bilingualDesc = [
  { name: 'description_en', type: 'textarea', labelEn: 'Description (EN)', labelAr: 'الوصف (إنجليزي)' },
  { name: 'description_ar', type: 'textarea', labelEn: 'Description (AR)', labelAr: 'الوصف (عربي)' },
];

const publicCheckbox = {
  name: 'is_public',
  type: 'checkbox',
  labelEn: 'Public',
  labelAr: 'عام',
  default: true,
};

const categoryConfig = {
  entity: 'categories',
  cardView: true,
  pageSize: 10,
  invalidateKey: 'categories',
  endpoint: '/categories',
  methods: {
    list: 'getCategories',
    create: 'createCategory',
    update: 'updateCategory',
    delete: 'deleteCategory',
  },
  titleKey: 'categories-title',
  addKey: 'add-category-text',
  nameColumn: 'name',
  statusFilter: true,
  imageUpload: { bucket: 'categories', pathPrefix: 'categories' },
  fields: [...bilingualName, ...bilingualDesc, publicCheckbox, { name: 'image', type: 'file', accept: 'image/*' }],
  columns: [
    { key: 'image', type: 'imageThumb', bucket: 'categories', headerEn: 'Image', headerAr: 'الصورة' },
    { key: 'name', type: 'bilingualName' },
    { key: 'description', type: 'bilingualText', maxWidth: 260 },
    { key: 'is_public', type: 'booleanBadge' },
  ],
};

const faqConfig = {
  entity: 'faqs',
  pageSize: 10,
  invalidateKey: 'faqs',
  endpoint: '/faqs',
  methods: {
    list: 'getFaqs',
    create: 'createFaq',
    update: 'updateFaq',
    delete: 'deleteFaq',
  },
  titleKey: 'nav-faqs',
  addKey: 'add-faq-text',
  nameColumn: 'question',
  fields: [
    { name: 'question_en', type: 'text', required: true, labelEn: 'Question (EN)', labelAr: 'السؤال (إنجليزي)' },
    { name: 'question_ar', type: 'text', required: true, labelEn: 'Question (AR)', labelAr: 'السؤال (عربي)' },
    { name: 'answer_en', type: 'textarea', labelEn: 'Answer (EN)', labelAr: 'الإجابة (إنجليزي)' },
    { name: 'answer_ar', type: 'textarea', labelEn: 'Answer (AR)', labelAr: 'الإجابة (عربي)' },
    { name: 'display_order', type: 'number', labelEn: 'Order', labelAr: 'الترتيب', default: 0 },
    publicCheckbox,
  ],
  columns: [
    { key: 'question', type: 'bilingualName', fields: ['question_en', 'question_ar'] },
    { key: 'display_order', type: 'text', headerEn: 'Order', headerAr: 'الترتيب' },
    { key: 'is_public', type: 'booleanBadge' },
  ],
};

const reviewConfig = {
  entity: 'reviews',
  cardView: true,
  cardMeta: { labelKey: 'nav-reviews', field: 'display_order' },
  pageSize: 10,
  invalidateKey: 'reviews',
  endpoint: '/reviews',
  methods: {
    list: 'getReviews',
    create: 'createReview',
    update: 'updateReview',
    delete: 'deleteReview',
  },
  titleKey: 'nav-reviews',
  addKey: 'add-review-text',
  statusFilter: true,
  imageUpload: { bucket: 'reviews', pathPrefix: 'reviews' },
  fields: [
    { name: 'display_order', type: 'number', labelEn: 'Order', labelAr: 'الترتيب', default: 0 },
    publicCheckbox,
    { name: 'image', type: 'file', accept: 'image/*' },
  ],
  columns: [
    { key: 'display_order', type: 'text', headerEn: 'Order', headerAr: 'الترتيب' },
    { key: 'is_public', type: 'booleanBadge' },
    { key: 'image', type: 'imageThumb', bucket: 'reviews' },
  ],
};

const successStoryConfig = {
  entity: 'success-stories',
  pageSize: 10,
  invalidateKey: 'successStories',
  endpoint: '/success-stories',
  dedicatedForm: true,
  methods: {
    list: 'getSuccessStories',
    create: 'createSuccessStory',
    update: 'updateSuccessStory',
    delete: 'deleteSuccessStory',
  },
  titleKey: 'nav-success-stories',
  addKey: 'add-story-text',
  statusFilter: true,
  featuredFilter: true,
  fields: [],
  columns: [
    { key: 'before_image', type: 'successStoryImage', side: 'before', headerKey: 'label-before' },
    { key: 'after_image', type: 'successStoryImage', side: 'after', headerKey: 'label-after' },
    { key: 'title', type: 'bilingualName', fields: ['title_en', 'title_ar'] },
    { key: 'content', type: 'bilingualText', fields: ['content_en', 'content_ar'] },
    { key: 'is_featured', type: 'booleanBadge', labelEn: 'Featured', labelAr: 'مميز' },
    { key: 'is_public', type: 'booleanBadge' },
  ],
};

const squashMedia = getMediaBuckets('squash');

const categoryConfigSquash = {
  ...categoryConfig,
  imageUpload: { bucket: squashMedia.categories, pathPrefix: squashMedia.categories },
  columns: categoryConfig.columns.map((col) =>
    col.key === 'image' ? { ...col, bucket: squashMedia.categories } : col
  ),
};

const reviewConfigSquash = {
  ...reviewConfig,
  imageUpload: { bucket: squashMedia.reviews, pathPrefix: squashMedia.reviews },
  columns: reviewConfig.columns.map((col) =>
    col.key === 'image' ? { ...col, bucket: squashMedia.reviews } : col
  ),
};

const packageConfigFitness = {
  entity: 'packages',
  pageSize: 10,
  invalidateKey: 'packages',
  endpoint: '/packages',
  methods: {
    list: 'getPackages',
    create: 'createPackage',
    update: 'updatePackage',
    delete: 'deletePackage',
  },
  titleKey: 'nav-packages',
  addKey: 'add-package-text',
  searchOnly: true,
  fields: [
    ...bilingualName,
    ...bilingualDesc,
    { name: 'price_egp', type: 'number', labelEn: 'Price (EGP)', labelAr: 'السعر (جنيه)' },
    { name: 'price_usd', type: 'number', labelEn: 'Price (USD)', labelAr: 'السعر (دولار)' },
    { name: 'duration_days', type: 'number', labelEn: 'Duration (days)', labelAr: 'المدة (أيام)' },
    { name: 'level', type: 'select', labelEn: 'Level', labelAr: 'المستوى', options: ['beginner', 'intermediate', 'advanced'] },
    { name: 'type', type: 'select', labelEn: 'Type', labelAr: 'النوع', options: ['training', 'nutrition', 'combined'] },
    { name: 'features_en', type: 'textarea', labelEn: 'Features (EN)', labelAr: 'المميزات (إنجليزي)' },
    { name: 'features_ar', type: 'textarea', labelEn: 'Features (AR)', labelAr: 'المميزات (عربي)' },
    { name: 'includes_video_feedback', type: 'checkbox', labelEn: 'Video feedback', labelAr: 'ملاحظات فيديو' },
    { name: 'daily_support', type: 'checkbox', labelEn: 'Daily support', labelAr: 'دعم يومي' },
  ],
  columns: [
    { key: 'name', type: 'bilingualName' },
    { key: 'duration_days', type: 'text', headerEn: 'Days', headerAr: 'أيام' },
    { key: 'price_egp', type: 'text', headerEn: 'EGP', headerAr: 'جنيه' },
  ],
};

const packageConfigSquash = {
  ...packageConfigFitness,
  fields: [
    ...bilingualName,
    ...bilingualDesc,
    { name: 'price', type: 'number', labelEn: 'Price', labelAr: 'السعر' },
    { name: 'duration_days', type: 'number', labelEn: 'Duration (days)', labelAr: 'المدة (أيام)' },
    { name: 'features_en', type: 'textarea', labelEn: 'Features (EN)', labelAr: 'المميزات (إنجليزي)' },
    { name: 'features_ar', type: 'textarea', labelEn: 'Features (AR)', labelAr: 'المميزات (عربي)' },
    { name: 'is_active', type: 'checkbox', labelEn: 'Active', labelAr: 'نشط', default: true },
  ],
  columns: [
    { key: 'name', type: 'bilingualName' },
    { key: 'duration_days', type: 'text', headerEn: 'Days', headerAr: 'أيام' },
    { key: 'is_active', type: 'booleanBadge', labelEn: 'Active', labelAr: 'نشط' },
  ],
};

const coachConfig = {
  entity: 'coaches',
  pageSize: 10,
  invalidateKey: 'coaches',
  endpoint: '/coaches',
  domains: ['squash'],
  methods: {
    list: 'getCoaches',
    create: 'createCoach',
    update: 'updateCoach',
    delete: 'deleteCoach',
  },
  titleKey: 'coaches-title',
  addKey: 'add-coach-text',
  imageUpload: { bucket: 'squash/coaches', pathPrefix: 'squash/coaches' },
  fields: [
    ...bilingualName,
    { name: 'title_en', type: 'text', labelEn: 'Title (EN)', labelAr: 'المسمى (إنجليزي)' },
    { name: 'title_ar', type: 'text', labelEn: 'Title (AR)', labelAr: 'المسمى (عربي)' },
    { name: 'bio_en', type: 'textarea', labelEn: 'Bio (EN)', labelAr: 'نبذة (إنجليزي)' },
    { name: 'bio_ar', type: 'textarea', labelEn: 'Bio (AR)', labelAr: 'نبذة (عربي)' },
    { name: 'display_order', type: 'number', labelEn: 'Order', labelAr: 'الترتيب', default: 0 },
    publicCheckbox,
    { name: 'image', type: 'file', accept: 'image/*' },
  ],
  columns: [
    { key: 'name', type: 'bilingualName' },
    { key: 'title', type: 'bilingualName', fields: ['title_en', 'title_ar'] },
    { key: 'is_public', type: 'booleanBadge' },
  ],
};

const programConfig = {
  entity: 'programs',
  pageSize: 10,
  invalidateKey: 'programs',
  endpoint: '/programs',
  domains: ['squash'],
  methods: {
    list: 'getPrograms',
    create: 'createProgram',
    update: 'updateProgram',
    delete: 'deleteProgram',
  },
  titleKey: 'programs-title',
  addKey: 'add-program-text',
  imageUpload: { bucket: 'squash/programs', pathPrefix: 'squash/programs' },
  fields: [
    ...bilingualName,
    ...bilingualDesc,
    { name: 'price', type: 'number', labelEn: 'Price', labelAr: 'السعر' },
    { name: 'duration_days', type: 'number', labelEn: 'Duration (days)', labelAr: 'المدة (أيام)' },
    { name: 'features_en', type: 'textarea', labelEn: 'Features (EN)', labelAr: 'المميزات (إنجليزي)' },
    { name: 'features_ar', type: 'textarea', labelEn: 'Features (AR)', labelAr: 'المميزات (عربي)' },
    { name: 'display_order', type: 'number', labelEn: 'Order', labelAr: 'الترتيب', default: 0 },
    { name: 'is_active', type: 'checkbox', labelEn: 'Active', labelAr: 'نشط', default: true },
    publicCheckbox,
    { name: 'image', type: 'file', accept: 'image/*' },
  ],
  columns: [
    { key: 'name', type: 'bilingualName' },
    { key: 'price', type: 'text', headerEn: 'Price', headerAr: 'السعر' },
    { key: 'is_public', type: 'booleanBadge' },
  ],
};

const fitnessEntities = {
  categories: categoryConfig,
  packages: packageConfigFitness,
  faqs: faqConfig,
  reviews: reviewConfig,
  'success-stories': successStoryConfig,
};

const squashEntities = {
  categories: categoryConfigSquash,
  packages: packageConfigSquash,
  faqs: faqConfig,
  reviews: reviewConfigSquash,
  'success-stories': successStoryConfig,
  coaches: coachConfig,
  programs: programConfig,
};

export function getEntityConfig(domain, entityKey) {
  const map = domain === 'squash' ? squashEntities : fitnessEntities;
  return map[entityKey] || null;
}

export function getDomainEntityKeys(domain) {
  return Object.keys(domain === 'squash' ? squashEntities : fitnessEntities);
}

export { fitnessEntities, squashEntities };
