import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../lib/cn';

const maxWidths = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

const PageShell = ({ children, maxWidth = 'xl', className, noPadding = false }) => (
  <div
    className={cn(
      'mx-auto w-full',
      maxWidths[maxWidth] || maxWidths.xl,
      !noPadding && 'px-4 sm:px-6 lg:px-8',
      className
    )}
  >
    {children}
  </div>
);

PageShell.propTypes = {
  children: PropTypes.node,
  maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  className: PropTypes.string,
  noPadding: PropTypes.bool,
};

export default PageShell;
