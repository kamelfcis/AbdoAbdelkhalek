import React, { useState, useCallback } from 'react';
import { useSquashI18n } from '../hooks/useSquashI18n';

const SquashContact = React.memo(() => {
  const { t, isRTL } = useSquashI18n();
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email?.value || '';
    const subject = encodeURIComponent('Squash Academy inquiry');
    const body = encodeURIComponent(`Name: ${form.name?.value || ''}\n\n${form.message?.value || ''}`);
    window.location.href = `mailto:info@abdelrhmanabdelkhalek.com?subject=${subject}&body=${body}${
      email ? `&reply-to=${encodeURIComponent(email)}` : ''
    }`;
    setSent(true);
  }, []);

  return (
    <section id="contact" className="section-py relative overflow-hidden bg-[var(--color-bg-muted)]">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 gradient-text">{t('contact.title')}</h2>
            <p className="text-[var(--color-text-muted)]">{t('contact.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] p-8 rounded-xl shadow-lg" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="mb-4">
              <label htmlFor="sq-contact-name" className="block text-[var(--color-text)] mb-2">
                {t('contact.name')}
              </label>
              <input
                id="sq-contact-name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="sq-contact-email" className="block text-[var(--color-text)] mb-2">
                {t('contact.email')}
              </label>
              <input
                id="sq-contact-email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="sq-contact-message" className="block text-[var(--color-text)] mb-2">
                {t('contact.message')}
              </label>
              <textarea
                id="sq-contact-message"
                name="message"
                required
                rows={5}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform"
            >
              {t('contact.submit')}
            </button>
            {sent && (
              <p className="mt-4 text-sm text-[var(--color-primary)]" role="status">
                {t('contact.sent')}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
});

SquashContact.displayName = 'SquashContact';

export default SquashContact;
