import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'stats' | 'block' | 'transaction' | 'custom';
  count?: number;
  className?: string;
  height?: string;
  width?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 1,
  className = '',
  height,
  width
}) => {
  const baseSkeletonClass = "animate-pulse bg-gradient-to-r from-green-500/10 via-green-400/20 to-green-500/10 rounded-lg";

  const renderStatsSkeleton = () => (
    <div className={`yafa-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`${baseSkeletonClass} h-4 w-24`} />
        <div className={`${baseSkeletonClass} h-8 w-8 rounded-lg`} />
      </div>
      <div className={`${baseSkeletonClass} h-8 w-32 mb-3`} />
      <div className={`${baseSkeletonClass} h-3 w-20`} />
    </div>
  );

  const renderBlockSkeleton = () => (
    <div className={`yafa-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`${baseSkeletonClass} h-10 w-10 rounded-lg`} />
          <div>
            <div className={`${baseSkeletonClass} h-5 w-20 mb-2`} />
            <div className={`${baseSkeletonClass} h-3 w-16`} />
          </div>
        </div>
        <div className="text-right">
          <div className={`${baseSkeletonClass} h-4 w-12 mb-1`} />
          <div className={`${baseSkeletonClass} h-4 w-16`} />
        </div>
      </div>
      
      <div className="mb-4">
        <div className={`${baseSkeletonClass} h-3 w-20 mb-1`} />
        <div className={`${baseSkeletonClass} h-4 w-40`} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className={`${baseSkeletonClass} h-3 w-16 mb-2`} />
          <div className={`${baseSkeletonClass} h-4 w-24`} />
        </div>
        <div>
          <div className={`${baseSkeletonClass} h-3 w-16 mb-2`} />
          <div className={`${baseSkeletonClass} h-4 w-20`} />
        </div>
      </div>
    </div>
  );

  const renderTransactionSkeleton = () => (
    <div className={`yafa-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`${baseSkeletonClass} h-10 w-10 rounded-lg`} />
          <div>
            <div className={`${baseSkeletonClass} h-5 w-32 mb-2`} />
            <div className={`${baseSkeletonClass} h-3 w-16`} />
          </div>
        </div>
        <div className="text-right">
          <div className={`${baseSkeletonClass} h-4 w-16 mb-1`} />
          <div className={`${baseSkeletonClass} h-4 w-20`} />
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className={`${baseSkeletonClass} h-3 w-10 mb-1`} />
            <div className={`${baseSkeletonClass} h-4 w-24`} />
          </div>
          <div className={`${baseSkeletonClass} h-5 w-5`} />
          <div className="flex-1">
            <div className={`${baseSkeletonClass} h-3 w-10 mb-1`} />
            <div className={`${baseSkeletonClass} h-4 w-24`} />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className={`${baseSkeletonClass} h-3 w-12 mb-2`} />
            <div className={`${baseSkeletonClass} h-4 w-16`} />
          </div>
        ))}
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="yafa-card py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className={`${baseSkeletonClass} h-4 w-4`} />
              <div className={`${baseSkeletonClass} h-4 w-32`} />
              <div className={`${baseSkeletonClass} h-3 w-16`} />
            </div>
            <div className="flex items-center space-x-4">
              <div className={`${baseSkeletonClass} h-4 w-20`} />
              <div className={`${baseSkeletonClass} h-3 w-12`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCustomSkeleton = () => (
    <div 
      className={`${baseSkeletonClass} ${className}`}
      style={{ 
        height: height || '20px', 
        width: width || '100%' 
      }}
    />
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'stats':
        return renderStatsSkeleton();
      case 'block':
        return renderBlockSkeleton();
      case 'transaction':
        return renderTransactionSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'custom':
        return renderCustomSkeleton();
      default:
        return renderBlockSkeleton(); // Default to block skeleton for 'card' type
    }
  };

  return (
    <div className="relative">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={count > 1 ? 'mb-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
      
      {/* Shimmer Overlay Effect */}
      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-shimmer pointer-events-none" />
    </div>
  );
};

export default SkeletonLoader;