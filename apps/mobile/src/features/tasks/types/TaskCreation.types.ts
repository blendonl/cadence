import { TaskFormState } from './TaskForm.types';

export interface TaskCreationHook {
  creating: boolean;
  createTask: (formData: TaskFormState) => Promise<boolean>;
}

export interface TaskCreationOptions {
  boardId: string;
  columnId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
