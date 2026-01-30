import { useState, useCallback } from 'react';

export type MetaPickerType = 'priority' | 'issueType' | null;

interface UseMetaPickerStateReturn {
  activeMetaPicker: MetaPickerType;
  togglePicker: (picker: 'priority' | 'issueType') => void;
  closePicker: () => void;
}

export function useMetaPickerState(): UseMetaPickerStateReturn {
  const [activeMetaPicker, setActiveMetaPicker] = useState<MetaPickerType>(null);

  const togglePicker = useCallback((picker: 'priority' | 'issueType') => {
    setActiveMetaPicker((current) => (current === picker ? null : picker));
  }, []);

  const closePicker = useCallback(() => {
    setActiveMetaPicker(null);
  }, []);

  return { activeMetaPicker, togglePicker, closePicker };
}
