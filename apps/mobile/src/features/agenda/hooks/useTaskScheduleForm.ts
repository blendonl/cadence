import { useState, useCallback } from 'react';
import { TaskType } from 'shared-types';
import { formatDateKey } from '@shared/utils/date.utils';

export interface ScheduleFormData {
  date: string;
  time: string;
  durationMinutes: number | undefined;
  taskType: TaskType;
  isAllDay: boolean;
  location: string;
  attendees: string;
}

interface UseTaskScheduleFormProps {
  initialDate?: string;
}

export const useTaskScheduleForm = ({ initialDate }: UseTaskScheduleFormProps = {}) => {
  const [formData, setFormData] = useState<ScheduleFormData>({
    date: initialDate || formatDateKey(new Date()),
    time: '',
    durationMinutes: undefined,
    taskType: TaskType.TASK,
    isAllDay: false,
    location: '',
    attendees: '',
  });

  const updateField = useCallback(<K extends keyof ScheduleFormData>(
    field: K,
    value: ScheduleFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);


  const reset = useCallback((date?: string) => {
    setFormData({
      date: date || formatDateKey(new Date()),
      time: '',
      durationMinutes: undefined,
      taskType: TaskType.TASK,
      isAllDay: false,
      location: '',
      attendees: '',
    });
  }, []);

  return {
    formData,
    updateField,
    reset,
  };
};
