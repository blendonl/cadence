import { TaskType, TaskPriority } from "shared-types";

export interface TaskFormState {
  title: string;
  description: string;
  parentId: string | null;
  issueType: TaskType;
  priority: TaskPriority;
}

export interface TaskFormActions {
  updateField: <K extends keyof TaskFormState>(
    field: K,
    value: TaskFormState[K],
  ) => void;
  reset: () => void;
  isValid: () => boolean;
  getData: () => TaskFormState;
}

export interface TaskFormHook {
  formState: TaskFormState;
  actions: TaskFormActions;
}
