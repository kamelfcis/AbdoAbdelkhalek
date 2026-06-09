import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '../../../../shared/ui';
import { dashTemplate } from '../../utils/dashTemplate';

const AccessSummaryBar = ({ categoryCount, videoCount, isDirty, tr }) => (
  <div
    className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2"
    data-testid="access-summary-bar"
  >
    <span className="text-sm text-[var(--color-text)]">
      {dashTemplate(tr('trainee-access-summary'), {
        categories: categoryCount,
        videos: videoCount,
      })}
    </span>
    {isDirty && (
      <Badge variant="warning" data-testid="access-unsaved-badge">
        {tr('trainee-access-unsaved')}
      </Badge>
    )}
  </div>
);

AccessSummaryBar.propTypes = {
  categoryCount: PropTypes.number.isRequired,
  videoCount: PropTypes.number.isRequired,
  isDirty: PropTypes.bool,
  tr: PropTypes.func.isRequired,
};

export default AccessSummaryBar;
