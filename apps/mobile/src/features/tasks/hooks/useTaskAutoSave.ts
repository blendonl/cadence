import { useState, useEffect, useCallback, useRef } from 'react';
import { TaskCreateResponseDto, TaskDto } from 'shared-types';
import { getTaskService } from '@core/di/hooks';
import { useDebounce } from '@shared/hooks/useDebounce';
import { uiConstants } from '@shared/theme/uiConstants';
import { SaveStatus } from '@shared/components/AutoSaveIndicator';
import { TaskFormState } from '../types';

interface UseTaskAutoSaveProps {
  task: TaskDto | null;
  columnId: string;
  formState: TaskFormState;
  onTaskCreated?: (task: TaskCreateResponseDto) => void;
}

interface UseTaskAutoSaveReturn {
  saveStatus: SaveStatus;
}

export function useTaskAutoSave({
  task,
  columnId,
  formState,
  onTaskCreated,
}: UseTaskAutoSaveProps): UseTaskAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const taskService = getTaskService();
  const isInitialMount = useRef(true);
  const initialValuesRef = useRef({
    title: task?.title || '',
    description: task?.description || '',
    parentId: task?.parentId || null,
    issueType: task?.taskType,
    priority: task?.priority,
  });

  const debouncedTitle = useDebounce(formState.title, uiConstants.AUTO_SAVE_DEBOUNCE_TIME);
  const debouncedDescription = useDebounce(formState.description, uiConstants.AUTO_SAVE_DEBOUNCE_TIME);

  const hasChanges = useCallback(() => {
    const initial = initialValuesRef.current;
    return (
      debouncedTitle !== initial.title ||
      debouncedDescription !== initial.description ||
      formState.parentId !== initial.parentId ||
      formState.issueType !== initial.issueType ||
      formState.priority !== initial.priority
    );
  }, [debouncedTitle, debouncedDescription, formState.parentId, formState.issueType, formState.priority]);

  const saveTask = useCallback(async () => {
    if (!debouncedTitle.trim()) return;
    if (!hasChanges()) return;

    setSaveStatus('saving');

    try {
      if (!task) {
        const newTask = await taskService.createTask({
          columnId,
          title: debouncedTitle.trim(),
          description: debouncedDescription.trim() || undefined,
          parentId: formState.parentId || null,
          taskType: formState.issueType,
          priority: formState.priority,
        });

        initialValuesRef.current = {
          title: newTask.title,
          description: newTask.description || '',
          parentId: newTask.parentId,
          issueType: newTask.taskType,
          priority: newTask.priority,
        };

        onTaskCreated?.(newTask);
      } else {
        await taskService.updateTask(task.id, {
          title: debouncedTitle.trim(),
          description: debouncedDescription.trim() || undefined,
          parentId: formState.parentId || null,
          taskType: formState.issueType,
          priority: formState.priority,
        });

        initialValuesRef.current = {
          title: debouncedTitle,
          description: debouncedDescription,
          parentId: formState.parentId,
          issueType: formState.issueType,
          priority: formState.priority,
        };
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [
    debouncedTitle,
    debouncedDescription,
    formState.priority,
    formState.parentId,
    formState.issueType,
    columnId,
    task,
    taskService,
    onTaskCreated,
    hasChanges,
  ]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    saveTask();
  }, [
    debouncedTitle,
    debouncedDescription,
    formState.priority,
    formState.parentId,
    formState.issueType,
  ]);

  return { saveStatus };
}
