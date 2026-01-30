import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { getTaskService } from "@core/di/hooks";
import alertService from "@services/AlertService";
import { TaskFormState, TaskCreationHook } from "../types";
import { TaskType } from "shared-types";
import logger from "@/utils/logger";

interface UseTaskCreationProps {
  columnId: string;
}

export function useTaskCreation({
  columnId,
}: UseTaskCreationProps): TaskCreationHook {
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const taskService = getTaskService();

  const createTask = useCallback(
    async (formData: TaskFormState): Promise<boolean> => {
      if (!formData.title) {
        alertService.showError("Please enter a task title");
        return false;
      }

      setCreating(true);

      try {
        const newTask = await taskService.createTask({
          columnId,
          title: formData.title,
          description: formData.description || undefined,
          parentId: formData.parentId || null,
          taskType: formData.issueType,
          priority: formData.priority,
        });

        router.back();
        return true;
      } catch (error) {
        alertService.showError(
          error instanceof Error ? error.message : "Failed to create task",
        );
        return false;
      } finally {
        setCreating(false);
      }
    },
    [columnId, taskService, router],
  );

  return {
    creating,
    createTask,
  };
}
