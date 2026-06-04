import React, { useEffect } from 'react';
import { themeIds } from '../../../design-system/themes';
import '../styles/squash-premium.css';

export function SquashPageLayout({ children }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-squash-ui', 'true');
    document.body.classList.add('squash-page');
    return () => {
      document.documentElement.removeAttribute('data-squash-ui');
      document.body.classList.remove('squash-page');
    };
  }, []);

  return (
    <div
      className="squash-page min-h-screen bg-[var(--squash-dark)] text-[var(--color-text)]"
      data-theme={themeIds.SQUASH}
    >
      {children}
    </div>
  );
}

export default SquashPageLayout;
