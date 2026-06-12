export function mapFaq(row) {
  return {
    ...row,
    question_en: row.question_en ?? row.questionEn,
    question_ar: row.question_ar ?? row.questionAr,
    answer_en: row.answer_en ?? row.answerEn,
    answer_ar: row.answer_ar ?? row.answerAr,
    order_index: row.order_index ?? row.orderIndex,
    is_active: row.is_active ?? row.isActive,
    created_at: row.created_at ?? row.createdAt,
    updated_at: row.updated_at ?? row.updatedAt,
  };
}
