import { useState, useCallback } from 'react';
import { TaskType } from 'shared-types';

export interface ScheduleFormData {
  date: string;
  time: string;
  durationMinutes: number;
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
    date: initialDate || new Date().toISOString().split('T')[0],
    time: '09:00',
    durationMinutes: 60,
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

  const toggleAllDay = useCallback(() => {
    setFormData(prev => ({ ...prev, isAllDay: !prev.isAllDay }));
  }, []);

  const reset = useCallback((date?: string) => {
    setFormData({
      date: date || new Date().toISOString().split('T')[0],
      time: '09:00',
      durationMinutes: 60,
      taskType: TaskType.TASK,
      isAllDay: false,
      location: '',
      attendees: '',
    });
  }, []);

  return {
    formData,
    updateField,
    toggleAllDay,
    reset,
  };
};
