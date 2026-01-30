import { useState, useCallback } from 'react';
import { Task } from '@features/tasks';

export function useAgendaModals() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const openScheduleModal = useCallback((task: Task) => {
    setSelectedTask(task);
    setShowScheduleModal(true);
  }, []);

  const closeScheduleModal = useCallback(() => {
    setShowScheduleModal(false);
    setSelectedTask(null);
  }, []);

  const openTaskSelector = useCallback(() => setShowTaskSelector(true), []);

  const closeTaskSelector = useCallback(() => setShowTaskSelector(false), []);

  const openTaskSelectorThenSchedule = useCallback((task: Task) => {
    closeTaskSelector();
    openScheduleModal(task);
  }, [closeTaskSelector, openScheduleModal]);

  return {
    showScheduleModal,
    showTaskSelector,
    selectedTask,
    openScheduleModal,
    closeScheduleModal,
    openTaskSelector,
    closeTaskSelector,
    openTaskSelectorThenSchedule,
  };
}
