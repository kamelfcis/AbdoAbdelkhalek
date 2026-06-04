import React from 'react';
import { useDashboardCoach } from '../context/DashboardCoachContext';
import { SectionHeader } from '../../../shared/layout';
import { Button, Table, EmptyState } from '../../../shared/ui';
import { TableSkeleton } from '../../fitness/components/Skeletons';
import { EntityPaginationBar } from '../crud/EntityPaginationBar';

export function TraineesSection() {
  const c = useDashboardCoach();
  return (
    <div className="section">
      <SectionHeader title={c.t('page-trainees-title')} />

      {c.traineesLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <Table
          isRTL={c.isRTL}
          data={c.trainees}
          emptyState={
            <EmptyState
              title={c.t('trainees-empty')}
              description={c.t('trainees-empty-desc')}
            />
          }
          columns={[
            {
              key: 'name',
              align: 'center',
              header: c.t('th-name'),
              render: (trainee) => trainee.full_name || c.t('na'),
            },
            {
              key: 'email',
              align: 'center',
              header: c.t('th-email'),
              render: (trainee) => trainee.email,
            },
            {
              key: 'phone',
              align: 'center',
              header: c.t('th-phone'),
              render: (trainee) => trainee.phone || c.t('na'),
            },
            {
              key: 'joined',
              align: 'center',
              header: c.t('th-joined'),
              render: (trainee) => (
                <span className="text-sm text-[var(--color-text-muted)]">
                  {trainee.created_at ? new Date(trainee.created_at).toLocaleDateString() : c.t('na')}
                </span>
              ),
            },
            {
              key: 'actions',
              align: 'center',
              header: c.t('th-actions'),
              render: (trainee) => (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      c.setActiveTrainee(trainee);
                      c.setShowTraineeAccessModal(true);
                    }}
                  >
                    <i className="fas fa-key text-green-600 me-1" aria-hidden="true" />
                    {c.t('btn-access')}
                  </Button>
                  {c.adminDomain === 'fitness' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        c.setTraineeForConversion(trainee);
                        c.setShowConvertToSubscriptionModal(true);
                      }}
                    >
                      <i className="fas fa-shopping-cart text-[var(--color-primary)] me-1" aria-hidden="true" />
                      {c.t('convert-to-subscription')}
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}

      <EntityPaginationBar
        t={c.t}
        isRTL={c.isRTL}
        page={c.traineePage}
        pageCount={c.traineePageCount}
        total={c.traineesTotal}
        pageSize={c.traineesPageSize}
        onPageChange={c.setTraineePage}
      />
    </div>
  );
}
