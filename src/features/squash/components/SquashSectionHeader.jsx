import React from 'react';
import { SquashReveal } from '../motion/SquashReveal';

export function SquashSectionHeader({ title, subtitle, align = 'center' }) {
  const alignClass =
    align === 'start' ? 'text-start' : align === 'end' ? 'text-end' : 'text-center';
  return (
    <SquashReveal className={`squash-container mb-12 md:mb-16 ${alignClass}`}>
      <h2 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-display)] squash-gradient-text mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base md:text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </SquashReveal>
  );
}

export default SquashSectionHeader;
