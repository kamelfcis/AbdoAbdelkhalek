import React from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox, Badge, Input } from '../../../shared/ui';
import { cn } from '../../../shared/lib/cn';

/** Shared modal footer with cancel + submit buttons */
export const ModalFormFooter = ({
  onClose,
  isSubmitting,
  submitLabel,
  savingLabel,
  cancelLabel,
  formId,
  onSubmit,
  summary,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    {summary ? <div className="flex-1 min-w-0">{summary}</div> : <div />}
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
  summary: PropTypes.node,
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

/** Bordered panel shell for category/video access lists */
export const AccessPanelShell = ({ title, toolbar, filters, children, testId, ariaLabel }) => (
  <section
    aria-label={ariaLabel}
    data-testid={testId}
    className={cn(
      'flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)]',
      'bg-[var(--color-surface)] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.1)]',
      'ring-1 ring-[var(--color-primary)]/10'
    )}
  >
    <div
      className={cn(
        'shrink-0 border-b border-[var(--color-border)] px-4 py-3',
        'bg-gradient-to-b from-[var(--color-bg-muted)]/95 to-[var(--color-surface)]/70 backdrop-blur-sm'
      )}
    >
      <h3 className="mb-2 font-semibold tracking-tight text-[var(--color-text)]">{title}</h3>
      {toolbar}
      {filters}
    </div>
    <div className="relative min-h-0 flex-1 p-3">{children}</div>
  </section>
);

AccessPanelShell.propTypes = {
  title: PropTypes.node.isRequired,
  toolbar: PropTypes.node,
  filters: PropTypes.node,
  children: PropTypes.node,
  testId: PropTypes.string,
  ariaLabel: PropTypes.string,
};

/** Scrollable list container with visible border and fade indicators */
export const AccessScrollList = React.forwardRef(
  ({ children, className, testId, style }, ref) => (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-5 rounded-t-xl bg-gradient-to-b from-[var(--color-bg-muted)]/40 to-transparent"
      />
      <div
        ref={ref}
        data-testid={testId}
        style={style}
        className={cn(
          'max-h-[52vh] min-h-[200px] overflow-y-auto rounded-xl',
          'border border-[var(--color-border)] bg-[var(--color-bg-muted)]/25',
          'shadow-[inset_0_2px_12px_rgba(0,0,0,0.05)]',
          'ring-1 ring-inset ring-[var(--color-primary)]/5',
          '[mask-image:linear-gradient(to_bottom,transparent,black_14px,black_calc(100%-14px),transparent)]',
          'space-y-1.5 p-2 pe-1',
          className
        )}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-5 rounded-b-xl bg-gradient-to-t from-[var(--color-bg-muted)]/40 to-transparent"
      />
    </div>
  )
);

AccessScrollList.displayName = 'AccessScrollList';

AccessScrollList.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  testId: PropTypes.string,
  style: PropTypes.object,
};

/** Card row with Radix Checkbox + label + optional meta */
export const AccessSelectableRow = ({
  id,
  label,
  checked,
  indeterminate,
  onCheckedChange,
  onRowClick,
  meta,
  className,
}) => (
  <div
    className={cn(
      'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200',
      checked
        ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/8 shadow-sm ring-1 ring-[var(--color-primary)]/15'
        : 'border-[var(--color-border)] bg-[var(--color-surface)]',
      'hover:-translate-y-px hover:border-[var(--color-primary)]/35 hover:shadow-md',
      onRowClick && 'cursor-pointer',
      className
    )}
    onClick={onRowClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onRowClick?.();
      }
    }}
    role={onRowClick ? 'button' : undefined}
    tabIndex={onRowClick ? 0 : undefined}
  >
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <Checkbox
        id={id}
        checked={checked}
        indeterminate={indeterminate}
        onCheckedChange={onCheckedChange}
        aria-label={typeof label === 'string' ? label : undefined}
      />
    </div>
    <label
      htmlFor={id}
      onClick={(e) => e.stopPropagation()}
      className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2"
    >
      <span className="truncate text-sm text-[var(--color-text)]">{label}</span>
      {meta && (
        <span className="shrink-0 text-xs text-[var(--color-text-muted)]">{meta}</span>
      )}
    </label>
  </div>
);

AccessSelectableRow.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.node,
  checked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  onCheckedChange: PropTypes.func,
  onRowClick: PropTypes.func,
  meta: PropTypes.node,
  className: PropTypes.string,
};

/** Search + bulk actions toolbar for access panels */
export const AccessPanelToolbar = ({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onGrantAll,
  onRevokeAll,
  grantLabel,
  revokeLabel,
  resultCount,
}) => (
  <div className="space-y-2">
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="min-w-[180px] flex-1"
        data-testid="access-panel-search"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onGrantAll}>
          {grantLabel}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onRevokeAll}>
          {revokeLabel}
        </Button>
      </div>
    </div>
    {typeof resultCount === 'number' && (
      <p className="text-xs text-[var(--color-text-muted)]" data-testid="access-result-count">
        {resultCount}
      </p>
    )}
  </div>
);

AccessPanelToolbar.propTypes = {
  searchPlaceholder: PropTypes.string,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  onGrantAll: PropTypes.func.isRequired,
  onRevokeAll: PropTypes.func.isRequired,
  grantLabel: PropTypes.string.isRequired,
  revokeLabel: PropTypes.string.isRequired,
  resultCount: PropTypes.number,
};

const isVideoPublic = (video) => video?.is_public === true || video?.isPublic === true;

/** Video access row with public/private indicator and badge */
export const VideoAccessRow = ({ video, label, checked, onChange, publicLabel, privateLabel }) => {
  const isPublic = isVideoPublic(video);
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-all duration-200',
        checked
          ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/8 shadow-sm ring-1 ring-[var(--color-primary)]/15'
          : 'border-[var(--color-border)] bg-[var(--color-surface)]',
        'hover:-translate-y-px hover:border-[var(--color-primary)]/35 hover:shadow-md'
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        aria-label={typeof label === 'string' ? label : undefined}
        id={`video-${video.id}`}
      />
      <label htmlFor={`video-${video.id}`} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
        <span
          data-testid={`video-public-indicator-${video.id}`}
          data-public={isPublic ? 'true' : 'false'}
          title={isPublic ? publicLabel : privateLabel}
          aria-label={isPublic ? publicLabel : privateLabel}
          className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
            isPublic ? 'bg-green-500' : 'bg-red-400'
          }`}
        />
        <Badge variant={isPublic ? 'success' : 'danger'} className="shrink-0">
          {isPublic ? publicLabel : privateLabel}
        </Badge>
        <span className="truncate text-sm text-[var(--color-text)]">{label}</span>
      </label>
    </div>
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
