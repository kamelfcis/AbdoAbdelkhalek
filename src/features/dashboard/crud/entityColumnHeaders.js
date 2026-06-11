const HEADER_KEY_BY_COLUMN = {
  name: 'th-name',
  description: 'th-description',
  is_public: 'th-public',
  is_featured: 'th-featured',
  is_active: 'th-active',
  image: 'th-image',
  question: 'th-question',
  question_ar: 'th-question',
  title: 'th-video-title',
  display_order: 'th-order',
  order_index: 'th-order',
  duration_days: 'th-duration-days',
  price_egp: 'th-price',
  price: 'th-price',
};

function humanizeKey(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Resolve a human-readable table header for entity CRUD columns.
 * Supports header, title, label, headerKey, headerEn/Ar, labelEn/Ar, and key/type defaults.
 */
export function resolveColumnHeader(col, { isAr = false, t } = {}) {
  if (!col) return '';

  const tr = typeof t === 'function' ? t : (key) => key;

  if (col.header != null && col.header !== '') return col.header;
  if (col.title != null && col.title !== '') return col.title;
  if (col.label != null && col.label !== '') return col.label;

  if (col.headerKey) {
    const translated = tr(col.headerKey);
    if (translated !== col.headerKey) return translated;
  }

  const explicit = isAr
    ? col.headerAr || col.labelAr
    : col.headerEn || col.labelEn;
  if (explicit) return explicit;

  const crossFallback = isAr
    ? col.headerEn || col.labelEn
    : col.headerAr || col.labelAr;
  if (crossFallback) return crossFallback;

  if (col.type === 'imageThumb') {
    const imageLabel = tr('th-image');
    return imageLabel !== 'th-image' ? imageLabel : isAr ? 'الصورة' : 'Image';
  }

  const mappedKey = HEADER_KEY_BY_COLUMN[col.key];
  if (mappedKey) {
    const translated = tr(mappedKey);
    if (translated !== mappedKey) return translated;
  }

  if (col.key) return humanizeKey(col.key);

  return '';
}
