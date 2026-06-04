import React from 'react';
import { SquashSectionHeader } from './SquashSectionHeader';
import { cn } from '../../../shared/lib/cn';

export function SquashSectionShell({ id, title, subtitle, children, className, align }) {
  return (
    <section id={id} className={cn('squash-section', className)} aria-labelledby={`${id}-title`}>
      <SquashSectionHeader title={title} subtitle={subtitle} align={align} />
      <div className="squash-container">{children}</div>
    </section>
  );
}

export default SquashSectionShell;
