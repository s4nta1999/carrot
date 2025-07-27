'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width = 80,
  height = 80,
  className = '',
  priority = false,
  sizes = '80px',
  fallbackSrc = '/images/placeholder.svg'
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        priority={priority}
        sizes={sizes}
        onError={handleError}
        onLoad={handleLoad}
        loading={priority ? 'eager' : 'lazy'}
        quality={85}
      />
    </div>
  );
} 