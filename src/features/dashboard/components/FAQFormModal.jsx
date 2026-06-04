import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { contentService } from '../../../shared/api/contentService';
import { Modal, Input, Textarea, toastWarning, toastSuccess, toastError } from '../../../shared/ui';
import { ModalFormFooter, CheckboxField } from './modalHelpers';

const FAQFormModal = ({ isOpen, onClose, faq, onSaved, currentLanguage = 'en' }) => {
  const [formData, setFormData] = useState({
    question_en: '',
    question_ar: '',
    answer_en: '',
    answer_ar: '',
    order_index: 0,
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAr = currentLanguage === 'ar';

  useEffect(() => {
    if (faq) {
      setFormData({
        question_en: faq.question_en || '',
        question_ar: faq.question_ar || '',
        answer_en: faq.answer_en || '',
        answer_ar: faq.answer_ar || '',
        order_index: faq.order_index ?? 0,
        is_active: Boolean(faq.is_active),
      });
    } else {
      setFormData({
        question_en: '',
        question_ar: '',
        answer_en: '',
        answer_ar: '',
        order_index: 0,
        is_active: true,
      });
    }
  }, [faq, isOpen]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.question_en.trim() || !formData.question_ar.trim()) {
      toastWarning(isAr ? 'يرجى إدخال السؤال' : 'Please enter the question');
      return;
    }

    if (!formData.answer_en.trim() || !formData.answer_ar.trim()) {
      toastWarning(isAr ? 'يرجى إدخال الإجابة' : 'Please provide the answer');
      return;
    }

    const payload = { ...formData, order_index: Number(formData.order_index) || 0 };
    setIsSubmitting(true);

    try {
      if (faq) {
        await contentService.updateFaq(faq.id, payload);
        toastSuccess(isAr ? 'تم تحديث السؤال بنجاح' : 'FAQ updated successfully');
      } else {
        await contentService.createFaq(payload);
        toastSuccess(isAr ? 'تم إضافة السؤال بنجاح' : 'FAQ added successfully');
      }
      onSaved?.();
      onClose?.();
    } catch (error) {
      toastError(error.message || 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = faq
    ? isAr ? 'تعديل سؤال' : 'Edit FAQ'
    : isAr ? 'إضافة سؤال' : 'Add FAQ';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <ModalFormFooter
          onClose={onClose}
          isSubmitting={isSubmitting}
          formId="faq-form"
          cancelLabel={isAr ? 'إلغاء' : 'Cancel'}
          savingLabel={isAr ? 'جاري الحفظ...' : 'Saving...'}
          submitLabel={faq ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'إضافة' : 'Add')}
        />
      }
    >
      <form id="faq-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={isAr ? 'السؤال (بالإنجليزية)' : 'Question (English)'}
            name="question_en"
            value={formData.question_en}
            onChange={handleInputChange}
            required
          />
          <Input
            label={isAr ? 'السؤال (بالعربية)' : 'Question (Arabic)'}
            name="question_ar"
            value={formData.question_ar}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            label={isAr ? 'الإجابة (بالإنجليزية)' : 'Answer (English)'}
            name="answer_en"
            value={formData.answer_en}
            onChange={handleInputChange}
            rows={5}
            required
          />
          <Textarea
            label={isAr ? 'الإجابة (بالعربية)' : 'Answer (Arabic)'}
            name="answer_ar"
            value={formData.answer_ar}
            onChange={handleInputChange}
            rows={5}
            required
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <Input
            label={isAr ? 'ترتيب العرض' : 'Display Order'}
            type="number"
            name="order_index"
            value={formData.order_index}
            onChange={handleInputChange}
            className="flex-1"
          />
          <CheckboxField
            label={isAr ? 'سؤال نشط' : 'Active FAQ'}
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
          />
        </div>
      </form>
    </Modal>
  );
};

FAQFormModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  faq: PropTypes.object,
  onSaved: PropTypes.func,
  currentLanguage: PropTypes.string,
};

export default FAQFormModal;
