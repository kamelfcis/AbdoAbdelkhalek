import React, { useState } from 'react';
import PropTypes from 'prop-types';

const AccessHelpCallout = ({ tr }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-bg-muted)]/80 to-[var(--color-surface)]/60 shadow-sm ring-1 ring-[var(--color-primary)]/8">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-start text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg-muted)]/40"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>
          <i className="fas fa-circle-info me-2 text-[var(--color-primary)]" aria-hidden="true" />
          {tr('trainee-access-help-title')}
        </span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-xs`} aria-hidden="true" />
      </button>
      {open && (
        <p className="border-t border-[var(--color-border)] bg-[var(--color-bg-muted)]/30 px-4 py-2.5 text-sm text-[var(--color-text-muted)]">
          {tr('trainee-access-help-body')}
        </p>
      )}
    </div>
  );
};

AccessHelpCallout.propTypes = {
  tr: PropTypes.func.isRequired,
};

export default AccessHelpCallout;
