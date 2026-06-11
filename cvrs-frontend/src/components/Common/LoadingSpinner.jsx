import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          {spinner}
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;

// Inline spinner component
export const InlineSpinner = ({ size = 'sm', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
  );
};

// Page loader component
export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading page...</p>
      </div>
    </div>
  );
};

// Skeleton loader for tables
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-10 rounded-t-lg mb-2"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-2 mb-2">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="bg-gray-200 h-12 flex-1 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Card skeleton loader
export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-200 h-12 w-12 rounded-full"></div>
            <div className="flex-1">
              <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="bg-gray-200 h-3 rounded"></div>
            <div className="bg-gray-200 h-3 rounded"></div>
            <div className="bg-gray-200 h-3 w-2/3 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};