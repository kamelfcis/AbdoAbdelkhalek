import React, { useState, useCallback } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getTranslation } from '../../../utils/translations';

const Contact = React.memo(({ onAlert }) => {
  const { currentLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Here you would typically send the form data to your backend or Supabase
      // For now, we'll just simulate a submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onAlert?.(getTranslation('form-success', currentLanguage));
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      onAlert?.('Error submitting form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [onAlert, currentLanguage]);

  const handleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  return (
    <section id="contact" className="section-py relative overflow-hidden bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 gradient-text">
              {getTranslation('contact-title', currentLanguage)}
            </h2>
            <p className="text-gray-600">
              {getTranslation('contact-intro', currentLanguage)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                {getTranslation('name-label', currentLanguage)}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                {getTranslation('subject-label', currentLanguage)}
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                {getTranslation('message-label', currentLanguage)}
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50"
            >
              {submitting ? 'Sending...' : getTranslation('submit-btn', currentLanguage)}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
});

Contact.displayName = 'Contact';

export default Contact;

