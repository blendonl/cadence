import { useState, useEffect, useCallback } from "react";
import { ProjectDetailDto } from "shared-types";
import { projectApi } from "../api/projectApi";

export function useProjectDetail(projectId: string | undefined) {
  const [project, setProject] = useState<ProjectDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    if (!projectId) return;

    try {
      const result = await projectApi.getProjectById(projectId);
      if (result) {
        setProject(result);
        setError(null);
      } else {
        setProject(null);
        setError(new Error("Project not found"));
      }
    } catch (err) {
      console.error("Failed to load project:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return {
    project,
    boards: project?.boards.slice(0, 3) || [],
    notes: project?.notes.slice(0, 3) || [],
    boardCount: project?.stats.boardCount || 0,
    noteCount: project?.stats.noteCount || 0,
    timeThisWeek: project?.stats.timeThisWeek || 0,
    loading,
    refreshing,
    error,
    refresh,
  };
}
