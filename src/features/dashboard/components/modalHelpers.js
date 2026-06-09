import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../../shared/ui';

/** Shared modal footer with cancel + submit buttons */
export const ModalFormFooter = ({
  onClose,
  isSubmitting,
  submitLabel,
  savingLabel,
  cancelLabel,
  formId,
  onSubmit,
}) => (
  <div className="flex flex-wrap gap-2 justify-end">
    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
      {cancelLabel}
    </Button>
    <Button
      variant="primary"
      loading={isSubmitting}
      disabled={isSubmitting}
      type={formId ? 'submit' : 'button'}
      form={formId}
      onClick={onSubmit}
    >
      {isSubmitting ? savingLabel : submitLabel}
    </Button>
  </div>
);

ModalFormFooter.propTypes = {
  onClose: PropTypes.func,
  isSubmitting: PropTypes.bool,
  submitLabel: PropTypes.node,
  savingLabel: PropTypes.node,
  cancelLabel: PropTypes.node,
  formId: PropTypes.string,
  onSubmit: PropTypes.func,
};

/** Checkbox row with token-based styling */
export const CheckboxField = ({ label, checked, onChange, name, className, leading }) => (
  <label className={`flex items-center gap-2 cursor-pointer ${className || ''}`}>
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-border-focus)]"
    />
    {leading}
    <span className="text-sm text-[var(--color-text)]">{label}</span>
  </label>
);

CheckboxField.propTypes = {
  label: PropTypes.node,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  name: PropTypes.string,
  className: PropTypes.string,
  leading: PropTypes.node,
};

const isVideoPublic = (video) => video?.is_public === true || video?.isPublic === true;

/** Video access row with public/private indicator dot */
export const VideoAccessRow = ({ video, label, checked, onChange, publicLabel, privateLabel }) => {
  const isPublic = isVideoPublic(video);
  return (
    <CheckboxField
      label={label}
      checked={checked}
      onChange={onChange}
      leading={
        <span
          data-testid={`video-public-indicator-${video.id}`}
          data-public={isPublic ? 'true' : 'false'}
          title={isPublic ? publicLabel : privateLabel}
          aria-label={isPublic ? publicLabel : privateLabel}
          className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${
            isPublic ? 'bg-green-500' : 'bg-red-400'
          }`}
        />
      }
    />
  );
};

VideoAccessRow.propTypes = {
  video: PropTypes.object.isRequired,
  label: PropTypes.node,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  publicLabel: PropTypes.string,
  privateLabel: PropTypes.string,
};

/** File input with label */
export const FileField = ({ label, accept, onChange, hint, preview }) => (
  <div>
    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{label}</label>
    <input
      type="file"
      accept={accept}
      onChange={onChange}
      className="w-full text-sm text-[var(--color-text-muted)] file:me-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-[var(--color-bg-muted)] file:text-[var(--color-text)]"
    />
    {hint && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>}
    {preview}
  </div>
);

FileField.propTypes = {
  label: PropTypes.node,
  accept: PropTypes.string,
  onChange: PropTypes.func,
  hint: PropTypes.node,
  preview: PropTypes.node,
};
