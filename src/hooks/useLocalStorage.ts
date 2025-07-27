import { useState, useEffect } from 'react';

// 로컬 스토리지 훅
export function useLocalStorage<T>(key: string, initialValue: T) {
  // 상태 초기화 함수
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`로컬 스토리지 읽기 오류 (${key}):`, error);
      return initialValue;
    }
  });

  // 로컬 스토리지에 값 저장
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`로컬 스토리지 저장 오류 (${key}):`, error);
    }
  };

  // 다른 탭에서의 변경사항 감지
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`로컬 스토리지 변경 감지 오류 (${key}):`, error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key]);

  return [storedValue, setValue] as const;
} 