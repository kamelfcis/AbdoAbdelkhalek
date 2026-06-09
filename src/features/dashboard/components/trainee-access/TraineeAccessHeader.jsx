import React from 'react';
import PropTypes from 'prop-types';

const getInitials = (name, email) => {
  const source = name || email || '';
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return '?';
};

const TraineeAccessHeader = ({ trainee, tr }) => {
  const traineeName = trainee?.full_name || trainee?.email || tr('page-trainee');
  const initials = getInitials(trainee?.full_name, trainee?.email);

  return (
    <div className="flex items-center gap-4 text-white">
      <div className="relative shrink-0" aria-hidden="true">
        <div className="absolute -inset-1 rounded-full bg-white/25 blur-md" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-sm font-bold shadow-lg ring-2 ring-white/40">
          {initials}
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold leading-snug tracking-tight">
          {tr('trainee-access-manage')}: {traineeName}
        </div>
        {trainee?.email && <div className="mt-1 text-sm text-white/85">{trainee.email}</div>}
      </div>
    </div>
  );
};

TraineeAccessHeader.propTypes = {
  trainee: PropTypes.object,
  tr: PropTypes.func.isRequired,
};

export default TraineeAccessHeader;
