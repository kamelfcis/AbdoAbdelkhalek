import React from 'react';

import { useDashboardDomain } from '../domain/DomainContext';

import { applyThemeVariables, themeIds } from '../../../design-system/themes';



export function DomainSwitcher({ isRTL, t }) {

  const { adminDomain, setAdminDomain } = useDashboardDomain();

  const tr = typeof t === 'function' ? t : (key) => key;



  const setDomain = (domain) => {

    setAdminDomain(domain);

    const mode = localStorage.getItem('themeMode') || 'light';

    applyThemeVariables(domain === 'squash' ? themeIds.SQUASH : themeIds.FITNESS, mode);

  };



  return (

    <div

      className="flex gap-1 p-1 rounded-lg bg-[var(--color-bg-muted)] mb-4"

      role="group"

      aria-label={tr('domain-switcher-label')}

    >

      <button

        type="button"

        onClick={() => setDomain('fitness')}

        className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition ${

          adminDomain === 'fitness'

            ? 'bg-[var(--color-primary)] text-white'

            : 'text-[var(--color-text-muted)] hover:bg-white/50'

        }`}

      >

        {tr('domain.fitness')}

      </button>

      <button

        type="button"

        onClick={() => setDomain('squash')}

        className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition ${

          adminDomain === 'squash'

            ? 'bg-[var(--color-primary)] text-white'

            : 'text-[var(--color-text-muted)] hover:bg-white/50'

        }`}

      >

        {tr('domain.squash')}

      </button>

    </div>

  );

}

