import React from 'react';
import { cn } from '../../../shared/lib/cn';

export function SquashGlassCard({ children, className, as: Component = 'div', ...rest }) {
  return (
    <Component className={cn('squash-glass rounded-2xl p-6 squash-card-hover', className)} {...rest}>
      {children}
    </Component>
  );
}

export default SquashGlassCard;
