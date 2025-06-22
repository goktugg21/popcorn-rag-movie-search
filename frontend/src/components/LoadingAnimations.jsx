import React from 'react';

// Spinner that can be used for small loading indicators
export const Spinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  
  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    white: 'border-white',
    gray: 'border-gray-300 dark:border-gray-600'
  };
  
  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-2 border-t-transparent ${colorClasses[color]}`}></div>
  );
};

// Generic loading container for smaller sections
export const LoadingContainer = ({ height = 'h-64', children }) => {
  return (
    <div className={`${height} w-full flex items-center justify-center`}>
      {children || <Spinner size="lg" />}
    </div>
  );
};

// Skeleton pulse animation wrapper
export const SkeletonPulse = ({ children, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
};

// Generic skeleton box
export const SkeletonBox = ({ width = 'w-full', height = 'h-4', className = '' }) => {
  return (
    <div className={`${width} ${height} bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>
  );
};

// Shimmer effect that can be applied to skeletons
export const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
);

export default {
  Spinner,
  LoadingContainer,
  SkeletonPulse,
  SkeletonBox,
  Shimmer
};
