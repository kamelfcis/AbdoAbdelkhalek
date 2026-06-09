import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getContentService } from '../../../shared/lib/getContentService';
import { getDashboardTranslation } from '../../../shared/i18n/dashboard';
import { normalizeListResponse } from '../../../shared/api/listUtils';
import { Modal, Spinner, Button, EmptyState, Select, toastSuccess, toastError } from '../../../shared/ui';
import { ModalFormFooter, CheckboxField, VideoAccessRow } from './modalHelpers';
import { dashTemplate } from '../utils/dashTemplate';

const EMPTY_LIST = [];
const FILTER_ALL = 'all';

const getVideoCategoryId = (video) => String(video.category_id ?? video.categoryId ?? '');

function AccessSection({ title, onGrantAll, onRevokeAll, grantLabel, revokeLabel, children }) {
  return (
    <section className="mb-6 last:mb-0">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onGrantAll}>
            {grantLabel}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onRevokeAll}>
            {revokeLabel}
          </Button>
        </div>
      </div>
      {children}
    </section>
  );
}

AccessSection.propTypes = {
  title: PropTypes.node.isRequired,
  onGrantAll: PropTypes.func.isRequired,
  onRevokeAll: PropTypes.func.isRequired,
  grantLabel: PropTypes.string.isRequired,
  revokeLabel: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const buildSelectedVideos = (access, catalogVideos) => {
  const fromDb = new Set(
    (access.videos || []).map((a) => String(a.videoId || a.video_id || ''))
  );
  const categoryIds = (access.categories || []).map((a) =>
    String(a.categoryId || a.category_id || '')
  );

  if (fromDb.size === 0 && categoryIds.length > 0) {
    catalogVideos
      .filter((v) => categoryIds.includes(getVideoCategoryId(v)))
      .forEach((v) => fromDb.add(String(v.id)));
  }

  return fromDb;
};

const TraineeAccessModal = ({
  isOpen,
  onClose,
  trainee,
  categories: categoriesProp = EMPTY_LIST,
  videos: videosProp = EMPTY_LIST,
  onSaved,
  currentLanguage = 'en',
  domain = 'fitness',
  t,
}) => {
  const tr = t || ((key) => getDashboardTranslation(domain, currentLanguage, key));
  const contentService = useMemo(() => getContentService(domain), [domain]);
  const [catalogCategories, setCatalogCategories] = useState([]);
  const [catalogVideos, setCatalogVideos] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [videoFilterCategoryId, setVideoFilterCategoryId] = useState(FILTER_ALL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isAr = currentLanguage === 'ar';

  useEffect(() => {
    if (!isOpen) {
      setCatalogCategories([]);
      setCatalogVideos([]);
      setSelectedCategories(new Set());
      setSelectedVideos(new Set());
      setVideoFilterCategoryId(FILTER_ALL);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !trainee?.id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const usePropCategories = categoriesProp.length > 0;
        const usePropVideos = videosProp.length > 0;

        const [categoriesResult, videosResult, access] = await Promise.all([
          usePropCategories
            ? Promise.resolve({ items: categoriesProp })
            : contentService.getCategories({ limit: 500, offset: 0 }),
          usePropVideos
            ? Promise.resolve({ items: videosProp })
            : contentService.getVideos({ limit: 500, offset: 0 }),
          contentService.getTraineeAccess(trainee.id),
        ]);

        const catItems = usePropCategories
          ? categoriesProp
          : normalizeListResponse(categoriesResult).items;
        const vidItems = usePropVideos ? videosProp : normalizeListResponse(videosResult).items;

        setCatalogCategories(catItems);
        setCatalogVideos(vidItems);
        setSelectedCategories(
          new Set(
            (access.categories || []).map((a) => String(a.categoryId || a.category_id || ''))
          )
        );
        setSelectedVideos(buildSelectedVideos(access, vidItems));
        setVideoFilterCategoryId(FILTER_ALL);
      } catch (e) {
        console.error(e);
        toastError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isOpen, trainee?.id, contentService, categoriesProp, videosProp]);

  const toggleCategory = (catId) => {
    const next = new Set(selectedCategories);
    const nextVideos = new Set(selectedVideos);
    const categoryVideos = catalogVideos.filter((v) => getVideoCategoryId(v) === catId);

    if (next.has(catId)) {
      next.delete(catId);
      categoryVideos.forEach((v) => nextVideos.delete(String(v.id)));
    } else {
      next.add(catId);
      categoryVideos.forEach((v) => nextVideos.add(String(v.id)));
    }
    setSelectedCategories(next);
    setSelectedVideos(nextVideos);
  };

  const toggleVideo = (set, id, setter) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await contentService.setTraineeAccess(trainee.id, {
        categoryIds: Array.from(selectedCategories),
        videoIds: Array.from(selectedVideos),
      });
      toastSuccess(tr('trainee-access-saved'));
      onSaved?.();
      onClose?.();
    } catch (e) {
      toastError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryFilterOptions = useMemo(
    () => [
      { value: FILTER_ALL, label: tr('trainee-access-videos-filter-all') },
      ...catalogCategories.map((cat) => ({
        value: String(cat.id),
        label: isAr ? cat.name_ar : cat.name_en,
      })),
    ],
    [catalogCategories, isAr, tr]
  );

  const visibleVideos = useMemo(() => {
    if (videoFilterCategoryId === FILTER_ALL) return catalogVideos;
    return catalogVideos.filter((v) => getVideoCategoryId(v) === videoFilterCategoryId);
  }, [catalogVideos, videoFilterCategoryId]);

  const isFilteringVideos = videoFilterCategoryId !== FILTER_ALL;

  const traineeName = trainee?.full_name || trainee?.email || tr('page-trainee');
  const modalTitle = (
    <div className="text-white">
      <div className="text-xl font-bold leading-snug">
        {tr('trainee-access-manage')}: {traineeName}
      </div>
      {trainee?.email && (
        <div className="text-sm text-white/90 mt-1">{trainee.email}</div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="xl"
      headerClassName="border-b-0 text-white [&_#modal-title]:text-white"
      headerStyle={{ background: 'var(--gradient-brand)' }}
      closeButtonClassName="text-white/90 hover:bg-white/10 hover:text-white"
      footer={
        <ModalFormFooter
          onClose={onClose}
          isSubmitting={isSubmitting}
          onSubmit={handleSave}
          cancelLabel={tr('btn-cancel')}
          savingLabel={tr('saving')}
          submitLabel={tr('btn-save-changes')}
        />
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-2">
          <AccessSection
            title={tr('trainee-access-categories-section')}
            grantLabel={tr('btn-grant-all')}
            revokeLabel={tr('btn-revoke-all')}
            onGrantAll={() =>
              setSelectedCategories(new Set(catalogCategories.map((cat) => String(cat.id))))
            }
            onRevokeAll={() => setSelectedCategories(new Set())}
          >
            {catalogCategories.length === 0 ? (
              <EmptyState icon="fa-folder-open" title={tr('trainee-access-categories')} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pe-1">
                {catalogCategories.map((cat) => {
                  const catId = String(cat.id);
                  return (
                    <CheckboxField
                      key={catId}
                      label={isAr ? cat.name_ar : cat.name_en}
                      checked={selectedCategories.has(catId)}
                      onChange={() => toggleCategory(catId)}
                    />
                  );
                })}
              </div>
            )}
          </AccessSection>

          <AccessSection
            title={tr('trainee-access-videos-section')}
            grantLabel={tr('btn-grant-all')}
            revokeLabel={tr('btn-revoke-all')}
            onGrantAll={() =>
              setSelectedVideos(new Set(visibleVideos.map((v) => String(v.id))))
            }
            onRevokeAll={() => setSelectedVideos(new Set())}
          >
            {catalogVideos.length === 0 ? (
              <EmptyState icon="fa-video" title={tr('videos-empty')} />
            ) : (
              <>
                <div className="mb-3 flex flex-wrap items-end gap-3">
                  <Select
                    label={tr('trainee-access-videos-filter-category')}
                    value={videoFilterCategoryId}
                    onChange={(e) => setVideoFilterCategoryId(e.target.value)}
                    options={categoryFilterOptions}
                    className="max-w-xs"
                    data-testid="video-category-filter"
                  />
                  <p className="text-xs text-[var(--color-text-muted)] pb-2.5">
                    {tr('trainee-access-public-legend')}
                  </p>
                </div>
                {visibleVideos.length === 0 ? (
                  <EmptyState icon="fa-video" title={tr('trainee-access-videos-filter-empty')} />
                ) : (
                  <>
                    {isFilteringVideos && (
                      <p className="text-sm text-[var(--color-text-muted)] mb-2">
                        {dashTemplate(tr('trainee-access-videos-filtered'), {
                          count: visibleVideos.length,
                        })}
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pe-1">
                      {visibleVideos.map((v) => {
                        const vidId = String(v.id);
                        return (
                          <VideoAccessRow
                            key={vidId}
                            video={v}
                            label={isAr ? v.title_ar : v.title_en}
                            checked={selectedVideos.has(vidId)}
                            onChange={() => toggleVideo(selectedVideos, vidId, setSelectedVideos)}
                            publicLabel={tr('filter-public')}
                            privateLabel={tr('filter-private')}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </AccessSection>
        </div>
      )}
    </Modal>
  );
};

TraineeAccessModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  trainee: PropTypes.object,
  categories: PropTypes.array,
  videos: PropTypes.array,
  onSaved: PropTypes.func,
  currentLanguage: PropTypes.string,
  domain: PropTypes.string,
  t: PropTypes.func,
};

export default TraineeAccessModal;
