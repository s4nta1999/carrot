import { useState, useEffect } from 'react';

// 디바운스 훅
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 검색 디바운스 훅
export function useSearchDebounce(searchTerm: string, delay: number = 300): string {
  return useDebounce(searchTerm, delay);
} 