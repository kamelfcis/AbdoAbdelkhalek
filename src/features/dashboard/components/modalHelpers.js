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
export const CheckboxField = ({ label, checked, onChange, name, className }) => (
  <label className={`flex items-center gap-2 cursor-pointer ${className || ''}`}>
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-border-focus)]"
    />
    <span className="text-sm text-[var(--color-text)]">{label}</span>
  </label>
);

CheckboxField.propTypes = {
  label: PropTypes.node,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  name: PropTypes.string,
  className: PropTypes.string,
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
