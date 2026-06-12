import { describe, it, expect } from 'vitest';
import { mapFaq } from './mapFaq';

describe('mapFaq', () => {
  it('maps camelCase Prisma fields to snake_case', () => {
    const result = mapFaq({
      id: 'faq-1',
      questionEn: 'What is fitness?',
      questionAr: 'ما هو اللياقة؟',
      answerEn: 'Fitness is health.',
      answerAr: 'اللياقة هي الصحة.',
      orderIndex: 2,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-06-01T00:00:00Z',
    });

    expect(result).toMatchObject({
      id: 'faq-1',
      question_en: 'What is fitness?',
      question_ar: 'ما هو اللياقة؟',
      answer_en: 'Fitness is health.',
      answer_ar: 'اللياقة هي الصحة.',
      order_index: 2,
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-06-01T00:00:00Z',
    });
  });

  it('passes through existing snake_case fields unchanged', () => {
    const input = {
      id: 'faq-2',
      question_en: 'Q',
      question_ar: 'س',
      answer_en: 'A',
      answer_ar: 'ج',
      order_index: 1,
      is_active: false,
      created_at: '2025-02-01',
      updated_at: '2025-03-01',
    };

    expect(mapFaq(input)).toMatchObject(input);
  });
});
