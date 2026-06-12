import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useSquashContent } from '../../../shared/hooks/useSquashContent';
import { useSquashI18n } from '../hooks/useSquashI18n';
import { pickItemField } from '../utils/localize';
import { useSquashThreeBackground } from '../hooks/useSquashThreeBackground';

function applyHeights(setAnswerHeights, answerRefs) {
  const heights = answerRefs.current.map((el) => el?.scrollHeight || 0);
  setAnswerHeights((prev) =>
    heights.length === prev.length && heights.every((h, i) => h === prev[i]) ? prev : heights
  );
}

const SquashFAQ = () => {
  const { t, isAr, isRTL } = useSquashI18n();
  const { data: faqsRaw = [], isLoading, error } = useSquashContent('faqs');
  const [openIndex, setOpenIndex] = useState(null);
  const answerRefs = useRef([]);
  const [answerHeights, setAnswerHeights] = useState([]);
  const canvasRef = useSquashThreeBackground();

  const faqs = useMemo(
    () =>
      [...faqsRaw]
        .filter((f) => f.is_active !== false)
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    [faqsRaw]
  );

  const measureHeights = useCallback(() => {
    applyHeights(setAnswerHeights, answerRefs);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      measureHeights();
    });
    return () => cancelAnimationFrame(id);
  }, [faqs, isAr, openIndex, measureHeights]);

  useEffect(() => {
    const handleResize = () => measureHeights();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measureHeights]);

  const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section id="faq" className="section-py relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-light)]/10 via-white/80 to-gray-50/90" style={{ zIndex: 1 }} />

      <div className="container mx-auto px-4 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 gradient-text">{t('faq.title')}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] mx-auto mb-6" />
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">{t('faq.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-16 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600">{t('common.error')}</p>
        ) : faqs.length === 0 ? (
          <p className="text-center text-gray-600">{t('faq.empty')}</p>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={faq.id} className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-transparent hover:border-[var(--color-primary)]/30">
                <button
                  type="button"
                  className={`w-full px-6 py-5 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/20 ${
                    isRTL ? 'flex-row-reverse text-right' : 'text-left'
                  }`}
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openIndex === index}
                >
                  <span className="font-bold text-gray-800 text-lg pr-4">
                    {pickItemField(faq, isAr, 'question_en', 'question_ar')}
                  </span>
                  <i className={`fas fa-chevron-down text-[var(--color-primary)] transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className="overflow-hidden transition-all duration-500 ease-in-out"
                  style={{ maxHeight: openIndex === index ? `${answerHeights[index] || 0}px` : '0px' }}
                >
                  <div
                    className="px-6 pb-5"
                    ref={(el) => {
                      answerRefs.current[index] = el;
                    }}
                  >
                    <p className={`text-gray-700 leading-relaxed pt-2 border-t border-[var(--color-primary-light)]/30 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {pickItemField(faq, isAr, 'answer_en', 'answer_ar')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SquashFAQ;
