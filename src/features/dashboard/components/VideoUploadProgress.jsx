import React from 'react';
import PropTypes from 'prop-types';
import './VideoUploadProgress.css';

const RING_SIZE = 144;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GRADIENT_ID = 'videoUploadGradient';

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

  return (
    <div className="video-upload-progress">
      <div className="video-upload-progress__panel">
        {/* SVG ring */}
        <div className="video-upload-progress__ring-wrap">
          <svg
            className="video-upload-progress__ring"
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          >
            <defs>
              <linearGradient id={GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <circle
              className="video-upload-progress__ring-track"
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
            />
            <circle
              className="video-upload-progress__ring-progress"
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>

          <div className="video-upload-progress__percent">
            {clampedProgress}%
          </div>
        </div>

        {/* Phase label */}
        <p className="video-upload-progress__phase">{phase}</p>

        {/* Shimmer bar */}
        <div className="video-upload-progress__bar">
          <div
            className="video-upload-progress__bar-fill"
            style={{ width: `${clampedProgress}%` }}
          />
          <div className="video-upload-progress__bar-shimmer" />
        </div>

        {/* File info */}
        {(fileName || fileSize) && (
          <p className="video-upload-progress__meta">
            {fileName}
            {fileName && fileSize ? ' · ' : ''}
            {fileSize ? formatFileSize(fileSize) : ''}
          </p>
        )}
      </div>
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
