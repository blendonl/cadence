import { useState, useEffect, useCallback } from "react";
import { container } from "tsyringe";
import { BackendProjectRepository } from "../infrastructure/BackendProjectRepository";
import { BACKEND_API_CLIENT } from "@core/di/tokens";

export function useProjectDetail(projectId: string | undefined) {
  const [data, setData] = useState<{
    project: any;
    boards: any[];
    notes: any[];
    stats: { boardCount: number; noteCount: number; timeThisWeek: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const repository = container.resolve(BackendProjectRepository);

  const loadData = useCallback(async () => {
    if (!projectId) return;

    try {
      const result = await repository.loadProjectByIdWithDetails(projectId);
      if (result) {
        setData(result);
        setError(null);
      } else {
        setData(null);
        setError(new Error("Project not found"));
      }
    } catch (err) {
      console.error("Failed to load project:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [projectId, repository]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return {
    project: data?.project,
    boards: data?.boards.slice(0, 3) || [],
    notes: data?.notes.slice(0, 3) || [],
    boardCount: data?.stats.boardCount || 0,
    noteCount: data?.stats.noteCount || 0,
    timeThisWeek: data?.stats.timeThisWeek || 0,
    loading,
    refreshing,
    error,
    refresh,
  };
}
