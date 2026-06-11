import { describe, it, expect } from 'vitest';
import { resolveColumnHeader } from './entityColumnHeaders';

const t = (key) =>
  ({
    'th-name': 'Name',
    'th-description': 'Description',
    'th-public': 'Public',
    'th-image': 'Image',
    'th-actions': 'Actions',
  }[key] ?? key);

describe('resolveColumnHeader', () => {
  it('uses explicit headerEn/headerAr', () => {
    expect(
      resolveColumnHeader({ key: 'image', headerEn: 'Photo', headerAr: 'صورة' }, { isAr: false, t })
    ).toBe('Photo');
    expect(
      resolveColumnHeader({ key: 'image', headerEn: 'Photo', headerAr: 'صورة' }, { isAr: true, t })
    ).toBe('صورة');
  });

  it('uses labelEn/labelAr for badge columns', () => {
    expect(
      resolveColumnHeader(
        { key: 'is_featured', type: 'booleanBadge', labelEn: 'Featured', labelAr: 'مميز' },
        { isAr: false, t }
      )
    ).toBe('Featured');
  });

  it('maps FAQ column keys to i18n labels', () => {
    const faqT = (key) =>
      ({
        'th-question': 'Question',
        'th-order': 'Order',
      }[key] ?? key);

    expect(
      resolveColumnHeader({ key: 'question_ar', type: 'text' }, { isAr: false, t: faqT })
    ).toBe('Question');
    expect(
      resolveColumnHeader({ key: 'order_index', type: 'text' }, { isAr: false, t: faqT })
    ).toBe('Order');
  });

  it('maps common keys to i18n labels', () => {
    expect(resolveColumnHeader({ key: 'name', type: 'bilingualName' }, { isAr: false, t })).toBe(
      'Name'
    );
    expect(
      resolveColumnHeader({ key: 'description', type: 'bilingualText' }, { isAr: false, t })
    ).toBe('Description');
    expect(
      resolveColumnHeader({ key: 'is_public', type: 'booleanBadge' }, { isAr: false, t })
    ).toBe('Public');
  });

  it('resolves imageThumb columns to Image', () => {
    expect(
      resolveColumnHeader({ key: 'image', type: 'imageThumb', bucket: 'categories' }, { isAr: false, t })
    ).toBe('Image');
  });

  it('supports pre-resolved header, title, and label props', () => {
    expect(resolveColumnHeader({ key: 'x', header: 'Custom' }, { isAr: false, t })).toBe('Custom');
    expect(resolveColumnHeader({ key: 'x', title: 'Title Col' }, { isAr: false, t })).toBe(
      'Title Col'
    );
    expect(resolveColumnHeader({ key: 'x', label: 'Label Col' }, { isAr: false, t })).toBe(
      'Label Col'
    );
  });

  it('humanizes unknown keys as last resort', () => {
    expect(resolveColumnHeader({ key: 'custom_field' }, { isAr: false, t })).toBe('Custom Field');
  });
});
