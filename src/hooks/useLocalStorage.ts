import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Handle date parsing for arrays of objects with date fields
        if (Array.isArray(parsed)) {
          return parsed.map((obj: Record<string, unknown>) => {
            const newObj = { ...obj };
            for (const [k, v] of Object.entries(newObj)) {
              if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
                newObj[k] = new Date(v);
              }
            }
            return newObj;
          }) as T;
        }
        return parsed;
      }
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}
