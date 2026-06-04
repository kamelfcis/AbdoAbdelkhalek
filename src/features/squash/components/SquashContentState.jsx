import React from 'react';
import { useSquashI18n } from '../hooks/useSquashI18n';

export function SquashContentState({ isLoading, error, empty, hasData, children }) {
  const { t } = useSquashI18n();

  if (isLoading) {
    return (
      <p className="text-center text-[var(--color-text-muted)] py-12" role="status">
        {t('common.loading')}
      </p>
    );
  }
  if (error) {
    return (
      <p className="text-center text-red-400 py-12" role="alert">
        {t('common.error')}
      </p>
    );
  }
  if (!hasData && empty) {
    return <p className="text-center text-[var(--color-text-muted)] py-12">{empty}</p>;
  }
  return children;
}

export default SquashContentState;
