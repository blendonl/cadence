import { useState, useEffect, useCallback } from 'react';
import { getProjectService, getBoardService, getTaskService } from '@core/di/hooks';
import { Note } from '@features/notes/domain/entities/Note';

interface EntityNames {
  projects: Map<string, string>;
  boards: Map<string, string>;
  tasks: Map<string, string>;
}

interface UseEntityNamesOptions {
  notes?: Note[];
  projectIds?: string[];
  boardIds?: string[];
  taskIds?: string[];
}

export const useEntityNames = (options: UseEntityNamesOptions = {}) => {
  const { notes, projectIds = [], boardIds = [], taskIds = [] } = options;

  const [entityNames, setEntityNames] = useState<EntityNames>({
    projects: new Map(),
    boards: new Map(),
    tasks: new Map(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadEntityNames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const projectService = getProjectService();
      const boardService = getBoardService();
      const taskService = getTaskService();

      const newEntityNames: EntityNames = {
        projects: new Map(),
        boards: new Map(),
        tasks: new Map(),
      };

      const allProjectIds = new Set<string>();
      const allBoardIds = new Set<string>();
      const allTaskIds = new Set<string>();

      if (notes) {
        notes.forEach(note => {
          note.project_ids.forEach(id => allProjectIds.add(id));
          note.board_ids.forEach(id => allBoardIds.add(id));
          note.task_ids.forEach(id => allTaskIds.add(id));
        });
      }

      projectIds.forEach(id => allProjectIds.add(id));
      boardIds.forEach(id => allBoardIds.add(id));
      taskIds.forEach(id => allTaskIds.add(id));

      for (const projectId of allProjectIds) {
        try {
          const project = await projectService.getProjectById(projectId);
          if (project) newEntityNames.projects.set(projectId, project.name);
        } catch (e) {
        }
      }

      for (const boardId of allBoardIds) {
        try {
          const board = await boardService.getBoardById(boardId);
          if (board) newEntityNames.boards.set(boardId, board.name);
        } catch (e) {
        }
      }

      for (const taskId of allTaskIds) {
        try {
        } catch (e) {
        }
      }

      setEntityNames(newEntityNames);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load entity names'));
    } finally {
      setLoading(false);
    }
  }, [notes, projectIds, boardIds, taskIds]);

  useEffect(() => {
    if (notes || projectIds.length > 0 || boardIds.length > 0 || taskIds.length > 0) {
      loadEntityNames();
    }
  }, [loadEntityNames]);

  return {
    entityNames,
    loading,
    error,
    reload: loadEntityNames,
  };
};
