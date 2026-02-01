import { useState, useEffect, useCallback } from 'react';
import { projectApi } from '@features/projects/api/projectApi';
import { NoteDetailDto } from 'shared-types';

interface EntityNames {
  projects: Map<string, string>;
  boards: Map<string, string>;
  tasks: Map<string, string>;
}

interface UseEntityNamesOptions {
  notes?: NoteDetailDto[];
  projectIds?: string[];
  boardIds?: string[];
  taskIds?: string[];
}

const EMPTY_IDS: string[] = [];

export const useEntityNames = (options: UseEntityNamesOptions = {}) => {
  const { notes, projectIds = EMPTY_IDS, boardIds = EMPTY_IDS, taskIds = EMPTY_IDS } = options;

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
          note.projectIds?.forEach(id => allProjectIds.add(id));
          note.boardIds?.forEach(id => allBoardIds.add(id));
          note.taskIds?.forEach(id => allTaskIds.add(id));
        });
      }

      projectIds.forEach(id => allProjectIds.add(id));
      boardIds.forEach(id => allBoardIds.add(id));
      taskIds.forEach(id => allTaskIds.add(id));

      for (const projectId of allProjectIds) {
        try {
          const project = await projectApi.getProjectById(projectId);
          if (project) newEntityNames.projects.set(projectId, project.name);
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
    const hasNotes = !!notes && notes.length > 0;
    const hasIds = projectIds.length > 0 || boardIds.length > 0 || taskIds.length > 0;

    if (hasNotes || hasIds) {
      loadEntityNames();
    }
  }, [loadEntityNames, notes, projectIds.length, boardIds.length, taskIds.length]);

  return {
    entityNames,
    loading,
    error,
    reload: loadEntityNames,
  };
};
