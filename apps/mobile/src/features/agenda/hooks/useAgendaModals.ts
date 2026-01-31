import { useState, useCallback } from 'react';
import { TaskDto } from 'shared-types';

export function useAgendaModals() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);

  const openScheduleModal = useCallback((task: TaskDto) => {
    setSelectedTask(task);
    setShowScheduleModal(true);
  }, []);

  const closeScheduleModal = useCallback(() => {
    setShowScheduleModal(false);
    setSelectedTask(null);
  }, []);

  const openTaskSelector = useCallback(() => setShowTaskSelector(true), []);

  const closeTaskSelector = useCallback(() => setShowTaskSelector(false), []);

  const openTaskSelectorThenSchedule = useCallback((task: TaskDto) => {
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
