import { useCallback, useRef } from 'react';

// 메모이제이션된 콜백 훅
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = useRef<T>(callback);
  
  // 최신 콜백 참조 업데이트
  ref.current = callback;
  
  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, deps) as T;
}

// 디바운스된 콜백 훅
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...deps]) as T;
} 