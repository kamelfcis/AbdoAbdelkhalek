import React from 'react';

import { useDashboardCoach } from './context/DashboardCoachContext';

import { useQueryClient } from '@tanstack/react-query';

import { invalidateContentCrud, invalidateAccessCrud } from '../../shared/lib/queryKeys';

import { Modal, Button, EmptyState } from '../../shared/ui';

import VideoFormModal from './components/VideoFormModal';

import TraineeAccessModal from './components/TraineeAccessModal';

import ResetTraineePasswordModal from './components/ResetTraineePasswordModal';

import VideoAccessModal from './components/VideoAccessModal';

import VideoPreviewModal from './components/VideoPreviewModal';



export function CoachDashboardModals() {

  const c = useDashboardCoach();

  const queryClient = useQueryClient();



  return (

    <>

      <VideoFormModal

        isOpen={c.showVideoForm}

        onClose={() => {

          c.setShowVideoForm(false);

          c.setEditingVideoId(null);

        }}

        video={c.editingVideo}

        categories={c.categories}

        domain={c.adminDomain}

        onSaved={() =>
          invalidateContentCrud(queryClient, 'videos', c.adminDomain, { deferSecondary: true })
        }

        currentLanguage={c.currentLanguage}

        t={c.t}

      />



      <TraineeAccessModal

        isOpen={c.showTraineeAccessModal}

        onClose={() => {

          c.setShowTraineeAccessModal(false);

          c.setActiveTrainee(null);

        }}

        trainee={c.activeTrainee}

        domain={c.adminDomain}

        onSaved={() => invalidateAccessCrud(queryClient, c.adminDomain)}

        currentLanguage={c.currentLanguage}

        t={c.t}

      />



      <ResetTraineePasswordModal

        isOpen={c.showResetTraineePasswordModal}

        onClose={() => {

          c.setShowResetTraineePasswordModal(false);

          c.setTraineeForPasswordReset(null);

        }}

        trainee={c.traineeForPasswordReset}

        domain={c.adminDomain}

        currentLanguage={c.currentLanguage}

        t={c.t}

      />



      <VideoAccessModal

        isOpen={c.showVideoAccessModal}

        onClose={() => {

          c.setShowVideoAccessModal(false);

          c.setActiveVideo(null);

        }}

        video={c.activeVideo}

        trainees={c.trainees}

        domain={c.adminDomain}

        onSaved={() => invalidateAccessCrud(queryClient, c.adminDomain)}

        currentLanguage={c.currentLanguage}

        t={c.t}

      />



      <Modal

        isOpen={Boolean(c.showConvertToSubscriptionModal && c.traineeForConversion)}

        onClose={() => {

          c.setShowConvertToSubscriptionModal(false);

          c.setTraineeForConversion(null);

        }}

        title={c.t('convert-to-subscription')}

        size="lg"

        footer={

          <div className="flex justify-end">

            <Button

              variant="secondary"

              onClick={() => {

                c.setShowConvertToSubscriptionModal(false);

                c.setTraineeForConversion(null);

              }}

            >

              {c.t('btn-cancel')}

            </Button>

          </div>

        }

      >

        {c.traineeForConversion && (

          <>

            <div className="mb-4 p-4 bg-[var(--color-bg-muted)] rounded-lg">

              <p className="text-sm text-[var(--color-text-muted)] mb-1">{c.t('convert-trainee-label')}</p>

              <p className="font-semibold text-[var(--color-text)]">

                {c.traineeForConversion.full_name || c.traineeForConversion.email}

              </p>

            </div>

            <p className="text-sm font-medium text-[var(--color-text)] mb-3">{c.t('select-package')}</p>

            {c.packages.length === 0 ? (

              <EmptyState title={c.t('no-packages-available')} />

            ) : (

              <div className="space-y-3 max-h-[50vh] overflow-y-auto">

                {c.packages.map((pkg) => (

                  <button

                    key={pkg.id}

                    type="button"

                    onClick={() => c.handleConvertToSubscription(c.traineeForConversion.id, pkg.id)}

                    className="w-full text-start p-4 border-2 border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-muted)] transition-all"

                  >

                    <h3 className="font-bold text-lg text-[var(--color-text)] mb-1">

                      {c.isRTL ? pkg.name_ar || pkg.name_en : pkg.name_en || pkg.name_ar}

                    </h3>

                  </button>

                ))}

              </div>

            )}

          </>

        )}

      </Modal>



      <VideoPreviewModal

        isOpen={c.showVideoModal && !!c.previewVideo}

        onClose={c.closeVideoPreview}

        video={c.previewVideo}

        videoUrl={c.previewVideoUrl}

        loading={c.previewVideoLoading}

        error={c.previewVideoError}

        currentLanguage={c.currentLanguage}

        isRTL={c.isRTL}

        domain={c.adminDomain}

        t={c.t}

      />

    </>

  );

}

