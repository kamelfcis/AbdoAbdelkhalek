import React from 'react';
import PropTypes from 'prop-types';

const RING_SIZE = 140;
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

const VideoUploadProgress = ({ progress, phase, fileName, fileSize }) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const dashOffset = CIRCUMFERENCE - (clampedProgress / 100) * CIRCUMFERENCE;
  const gradientId = 'upload-progress-gradient';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(10, 10, 20, 0.82)',
        borderRadius: 'inherit',
        gap: '20px',
      }}
    >
      {/* SVG ring */}
      <div style={{ position: 'relative', width: RING_SIZE, height: RING_SIZE }}>
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Track ring */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={STROKE_WIDTH}
          />

          {/* Progress ring */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>

        {/* Percentage label inside ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <span
            style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: '#ffffff',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              fontVariantNumeric: 'tabular-nums',
              transition: 'all 0.3s ease',
            }}
          >
            {clampedProgress}%
          </span>
        </div>
      </div>

      {/* Phase label */}
      <p
        style={{
          color: 'rgba(255,255,255,0.75)',
          fontSize: '0.875rem',
          fontWeight: '500',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          margin: 0,
          minHeight: '1.25rem',
          transition: 'all 0.3s ease',
        }}
      >
        {phase}
      </p>

      {/* Shimmer bar */}
      <div
        style={{
          width: '220px',
          height: '6px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: '9999px',
            width: `${clampedProgress}%`,
            background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer effect */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
              animation: 'shimmer-slide 1.4s linear infinite',
            }}
          />
        </div>
      </div>

      {/* File info */}
      {(fileName || fileSize) && (
        <p
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.75rem',
            margin: 0,
            maxWidth: '260px',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {fileName}
          {fileName && fileSize ? ' · ' : ''}
          {fileSize ? formatFileSize(fileSize) : ''}
        </p>
      )}

      <style>{`
        @keyframes shimmer-slide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

VideoUploadProgress.propTypes = {
  progress: PropTypes.number.isRequired,
  phase: PropTypes.string,
  fileName: PropTypes.string,
  fileSize: PropTypes.number,
};

VideoUploadProgress.defaultProps = {
  phase: '',
  fileName: '',
  fileSize: null,
};

export default VideoUploadProgress;
