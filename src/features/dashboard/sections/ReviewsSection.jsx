import React from 'react';
import { GenericEntitySection } from '../crud/GenericEntitySection';
import { useDashboardCoach } from '../context/DashboardCoachContext';
import { getContentService } from '../../../shared/lib/getContentService';
import { invalidateContentCrud } from '../../../shared/lib/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../shared/ui';
import { showSuccess, showError } from '../../../shared/lib/notifications';

export function ReviewsSection() {
  const c = useDashboardCoach();
  const queryClient = useQueryClient();
  const isAr = c.currentLanguage === 'ar';

  const toggleVisibility = async (review) => {
    try {
      const svc = getContentService(c.adminDomain);
      await svc.updateReview(review.id, { isPublic: !review.is_public });
      showSuccess(isAr ? 'تم التحديث' : 'Updated');
      invalidateContentCrud(queryClient, 'reviews', c.adminDomain);
    } catch (e) {
      showError(e.message);
    }
  };

  return (
    <GenericEntitySection
      entityKey="reviews"
      actionsExtra={(row) => (
        <Button variant="ghost" size="sm" onClick={() => toggleVisibility(row)} aria-label="Toggle visibility">
          <i className={`fas fa-eye${row.is_public ? '' : '-slash'} text-[var(--color-primary)]`} aria-hidden="true" />
        </Button>
      )}
    />
  );
}
