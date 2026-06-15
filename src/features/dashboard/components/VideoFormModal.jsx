import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { getContentService } from '../../../shared/lib/getContentService';
import { uploadService } from '../../../shared/api/uploadService';
import { getSharedContentMediaBuckets } from '../../../shared/lib/mediaBuckets';
import { getDashboardTranslation } from '../../../shared/i18n/dashboard';
import {
  Modal,
  Input,
  Textarea,
  Select,
  toastWarning,
  toastSuccess,
  toastError,
} from '../../../shared/ui';
import { ModalFormFooter, CheckboxField, FileField } from './modalHelpers';
import VideoUploadProgress from './VideoUploadProgress';

const VIDEO_PROGRESS_WEIGHT = 0.8;
const THUMBNAIL_PROGRESS_WEIGHT = 0.2;

const VideoFormModal = ({
  isOpen,
  onClose,
  video,
  onSaved,
  categories = [],
  currentLanguage = 'en',
  domain = 'fitness',
  t,
}) => {
  const tr = t || ((key) => getDashboardTranslation(domain, currentLanguage, key));
  const contentService = getContentService(domain);
  const mediaBuckets = useMemo(() => getSharedContentMediaBuckets(domain, 'videos'), [domain]);
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    category_id: '',
    duration_seconds: '',
    is_public: true,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState('');
  const [activeUploadFile, setActiveUploadFile] = useState(null);
  const isAr = currentLanguage === 'ar';

  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        value: cat.id,
        label: isAr ? cat.name_ar || cat.name_en : cat.name_en || cat.name_ar,
      })),
    [categories, isAr]
  );

  const resetUploadProgress = () => {
    setUploadProgress(0);
    setUploadPhase('');
    setActiveUploadFile(null);
  };

  useEffect(() => {
    if (video) {
      setFormData({
        title_en: video.title_en || '',
        title_ar: video.title_ar || '',
        description_en: video.description_en || '',
        description_ar: video.description_ar || '',
        category_id: video.category_id || '',
        duration_seconds: video.duration_seconds || '',
        is_public: Boolean(video.is_public),
      });
      setVideoFile(null);
      setThumbnailFile(null);
    } else {
      setFormData({
        title_en: '',
        title_ar: '',
        description_en: '',
        description_ar: '',
        category_id: '',
        duration_seconds: '',
        is_public: true,
      });
      setVideoFile(null);
      setThumbnailFile(null);
    }
    resetUploadProgress();
  }, [video, isOpen]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const uploadFile = async ({
    bucket,
    file,
    videoId,
    column,
    pathColumn,
    weight,
    baseProgress,
    phaseLabel,
  }) => {
    if (!file) return;

    setUploadPhase(phaseLabel);
    setActiveUploadFile(file);

    const fileExt = file.name.split('.').pop();
    const filePath = `${videoId}-${Date.now()}.${fileExt}`;

    const { publicUrl } = await uploadService.uploadFile({
      bucket,
      path: filePath,
      file,
      onProgress: (filePct) => {
        setUploadProgress(Math.round(baseProgress + (filePct / 100) * weight * 100));
      },
    });

    const updatePayload = {};
    if (column === 'video_url') updatePayload.videoUrl = publicUrl;
    if (column === 'thumbnail_url') updatePayload.thumbnailUrl = publicUrl;
    if (pathColumn === 'video_path') updatePayload.videoPath = filePath;
    if (pathColumn === 'thumbnail_path') updatePayload.thumbnailPath = filePath;

    await contentService.updateVideo(videoId, updatePayload);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title_en.trim() || !formData.title_ar.trim()) {
      toastWarning(tr('video-title-required'));
      return;
    }

    if (!formData.category_id) {
      toastWarning(tr('video-category-required'));
      return;
    }

    const hasUploads = Boolean(videoFile || thumbnailFile);

    setIsSubmitting(true);
    if (hasUploads) {
      setUploadPhase(tr('video-upload-preparing') || 'Preparing…');
      setUploadProgress(2);
    }

    try {
      if (video) {
        await contentService.updateVideo(video.id, {
          titleEn: formData.title_en,
          titleAr: formData.title_ar,
          descriptionEn: formData.description_en,
          descriptionAr: formData.description_ar,
          categoryId: formData.category_id,
          durationSeconds: formData.duration_seconds ? Number(formData.duration_seconds) : null,
          isPublic: formData.is_public,
        });

        if (hasUploads) setUploadProgress(5);

        if (videoFile) {
          await uploadFile({
            bucket: mediaBuckets.videos,
            file: videoFile,
            videoId: video.id,
            column: 'video_url',
            pathColumn: 'video_path',
            weight: VIDEO_PROGRESS_WEIGHT,
            baseProgress: 0,
            phaseLabel: tr('video-upload-video') || 'Uploading video…',
          });
        }

        if (thumbnailFile) {
          await uploadFile({
            bucket: mediaBuckets.videoThumbnails,
            file: thumbnailFile,
            videoId: video.id,
            column: 'thumbnail_url',
            pathColumn: 'thumbnail_path',
            weight: THUMBNAIL_PROGRESS_WEIGHT,
            baseProgress: VIDEO_PROGRESS_WEIGHT * 100,
            phaseLabel: tr('video-upload-thumbnail') || 'Uploading thumbnail…',
          });
        }

        toastSuccess(tr('video-updated'));
      } else {
        const data = await contentService.createVideo({
          titleEn: formData.title_en,
          titleAr: formData.title_ar,
          descriptionEn: formData.description_en,
          descriptionAr: formData.description_ar,
          categoryId: formData.category_id,
          durationSeconds: formData.duration_seconds ? Number(formData.duration_seconds) : null,
          isPublic: formData.is_public,
          videoUrl: 'pending',
        });

        if (data?.id) {
          if (hasUploads) setUploadProgress(5);

          if (videoFile) {
            await uploadFile({
              bucket: mediaBuckets.videos,
              file: videoFile,
              videoId: data.id,
              column: 'video_url',
              pathColumn: 'video_path',
              weight: VIDEO_PROGRESS_WEIGHT,
              baseProgress: 0,
              phaseLabel: tr('video-upload-video') || 'Uploading video…',
            });
          }

          if (thumbnailFile) {
            await uploadFile({
              bucket: mediaBuckets.videoThumbnails,
              file: thumbnailFile,
              videoId: data.id,
              column: 'thumbnail_url',
              pathColumn: 'thumbnail_path',
              weight: THUMBNAIL_PROGRESS_WEIGHT,
              baseProgress: VIDEO_PROGRESS_WEIGHT * 100,
              phaseLabel: tr('video-upload-thumbnail') || 'Uploading thumbnail…',
            });
          }
        }

        toastSuccess(tr('video-added'));
      }

      if (hasUploads) {
        setUploadPhase(tr('video-upload-saving') || 'Saving…');
        setUploadProgress(100);
      }

      onSaved?.();
      onClose?.();
    } catch (error) {
      toastError(error.message || 'Error');
    } finally {
      setIsSubmitting(false);
      resetUploadProgress();
    }
  };

  const title = video ? tr('edit-video') : tr('add-video-modal');
  const showUploadProgress = uploadProgress > 0 && uploadProgress < 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="xl"
      footer={
        <ModalFormFooter
          onClose={onClose}
          isSubmitting={isSubmitting}
          formId="video-form"
          cancelLabel={tr('btn-cancel')}
          savingLabel={tr('saving')}
          submitLabel={video ? tr('btn-update') : tr('btn-add')}
        />
      }
    >
      <div className="relative min-h-[12rem]">
        {showUploadProgress ? (
          <VideoUploadProgress
            progress={uploadProgress}
            phase={uploadPhase}
            fileName={activeUploadFile?.name}
            fileSize={activeUploadFile?.size}
          />
        ) : null}

        <form id="video-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={tr('video-form-title-en')}
              name="title_en"
              value={formData.title_en}
              onChange={handleInputChange}
              required
            />
            <Input
              label={tr('video-form-title-ar')}
              name="title_ar"
              value={formData.title_ar}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label={tr('video-form-desc-en')}
              name="description_en"
              value={formData.description_en}
              onChange={handleInputChange}
              rows={4}
            />
            <Textarea
              label={tr('video-form-desc-ar')}
              name="description_ar"
              value={formData.description_ar}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Select
              label={tr('video-form-category')}
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              options={categoryOptions}
              placeholder={tr('video-form-category-placeholder')}
              required
            />
            <Input
              label={tr('video-form-duration')}
              type="number"
              min="0"
              name="duration_seconds"
              value={formData.duration_seconds}
              onChange={handleInputChange}
            />
            <CheckboxField
              label={tr('video-form-public')}
              name="is_public"
              checked={formData.is_public}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileField
              label={tr('video-form-file')}
              accept="video/*"
              onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
              hint={video?.video_url && !videoFile ? tr('video-form-file-uploaded') : null}
            />
            <FileField
              label={tr('video-form-thumbnail')}
              accept="image/*"
              onChange={(event) => setThumbnailFile(event.target.files?.[0] || null)}
              preview={
                video?.thumbnail_url && !thumbnailFile ? (
                  <div className="mt-3">
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">
                      {tr('video-form-thumbnail-current')}
                    </p>
                    <img
                      src={video.thumbnail_url}
                      alt="Thumbnail"
                      className="w-24 h-24 object-cover rounded-lg border border-[var(--color-border)]"
                    />
                  </div>
                ) : null
              }
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

VideoFormModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  video: PropTypes.object,
  onSaved: PropTypes.func,
  categories: PropTypes.array,
  currentLanguage: PropTypes.string,
  domain: PropTypes.string,
  t: PropTypes.func,
};

export default VideoFormModal;
