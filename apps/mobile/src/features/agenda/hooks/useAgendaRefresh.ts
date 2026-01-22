import { useState, useCallback } from 'react';
import { useAutoRefresh } from '@shared/hooks/useAutoRefresh';

interface UseAgendaRefreshProps {
  onRefresh: () => Promise<void>;
  cacheFreshnessMs?: number;
}

export function useAgendaRefresh({ onRefresh, cacheFreshnessMs = 30000 }: UseAgendaRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);

  const performRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  // Auto-refresh when 'agenda_invalidated' event is triggered
  useAutoRefresh(['agenda_invalidated'], performRefresh);

  // Note: Removed useFocusEffect due to navigation context timing issues with expo-router
  // The screen still refreshes via:
  // 1. Pull-to-refresh gesture in AgendaDayContent
  // 2. Auto-refresh events via useAutoRefresh
  // 3. Manual refresh when view changes (handled in useAgendaScreen)

  return {
    refreshing,
    performRefresh,
  };
}
