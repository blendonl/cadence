import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useCollapsibleSection(storageKey: string, defaultCollapsed = false) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        if (saved !== null) {
          setIsCollapsed(saved === 'true');
        }
      } catch (error) {
        console.error('Failed to load collapse state:', error);
      }
    };

    loadState();
  }, [storageKey]);

  const toggle = useCallback(async () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    try {
      await AsyncStorage.setItem(storageKey, String(newState));
    } catch (error) {
      console.error('Failed to save collapse state:', error);
    }
  }, [isCollapsed, storageKey]);

  return { isCollapsed, toggle };
}
