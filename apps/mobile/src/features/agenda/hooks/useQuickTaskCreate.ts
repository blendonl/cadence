import { useState, useCallback } from 'react';
import { TaskDto, TaskPriority, TaskType } from 'shared-types';
import { getTaskService } from '@core/di/hooks';

interface QuickTaskCreateState {
  title: string;
  description: string;
  priority: TaskPriority | null;
  taskType: TaskType;
  expanded: boolean;
  creating: boolean;
  error: string | null;
}

const INITIAL_STATE: QuickTaskCreateState = {
  title: '',
  description: '',
  priority: null,
  taskType: TaskType.TASK,
  expanded: false,
  creating: false,
  error: null,
};

export function useQuickTaskCreate() {
  const [state, setState] = useState<QuickTaskCreateState>(INITIAL_STATE);

  const setTitle = useCallback((title: string) => {
    setState(prev => ({ ...prev, title, error: null }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setState(prev => ({ ...prev, description }));
  }, []);

  const setPriority = useCallback((priority: TaskPriority) => {
    setState(prev => ({ ...prev, priority }));
  }, []);

  const setTaskType = useCallback((taskType: TaskType) => {
    setState(prev => ({ ...prev, taskType }));
  }, []);

  const toggleExpanded = useCallback(() => {
    setState(prev => ({ ...prev, expanded: !prev.expanded }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const submitQuickCreate = useCallback(async (): Promise<TaskDto | null> => {
    const trimmedTitle = state.title.trim();
    if (!trimmedTitle) {
      setState(prev => ({ ...prev, error: 'Title is required' }));
      return null;
    }

    setState(prev => ({ ...prev, creating: true, error: null }));

    try {
      const taskService = getTaskService();
      const task = await taskService.quickCreateTask({
        title: trimmedTitle,
        description: state.description.trim() || undefined,
        priority: state.priority ?? undefined,
        taskType: state.taskType !== TaskType.TASK ? state.taskType : undefined,
      });
      reset();
      return task;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      setState(prev => ({ ...prev, creating: false, error: message }));
      return null;
    }
  }, [state.title, state.description, state.priority, state.taskType, reset]);

  return {
    ...state,
    setTitle,
    setDescription,
    setPriority,
    setTaskType,
    toggleExpanded,
    reset,
    submitQuickCreate,
  };
}
