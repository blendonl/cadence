import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AgendaItemEnrichedDto, AgendaItemsDayDto, AgendaViewMode, TaskDto } from 'shared-types';
import { agendaApi } from '../api/agendaApi';
import { useAutoRefresh } from '@shared/hooks/useAutoRefresh';
import { useUnfinishedTasks } from './useUnfinishedTasks';
import { useSwipeGesture } from './useSwipeGesture';
import { useHaptics } from './useHaptics';
import { useTimelineScroll } from './useTimelineScroll';
import { useProcessedAgendaData } from './useProcessedAgendaData';
import { formatDateKey } from '@shared/utils/date.utils';
import { getDateRange, getNavigationDates, getViewLabel } from '../utils/dateRangeHelpers';
import { TaskScheduleData } from '../components/TaskScheduleModal';

const CACHE_FRESHNESS_MS = 30000;

export function useAgendaScreen() {
  const router = useRouter();
  const haptics = useHaptics();

  const [viewMode, setViewMode] = useState<AgendaViewMode>('day');
  const [anchorDate, setAnchorDate] = useState(formatDateKey(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rawDays, setRawDays] = useState<AgendaItemsDayDto[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewError, setViewError] = useState<Error | null>(null);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  const { isDrawerOpen, openDrawer, closeDrawer } = useUnfinishedTasks();

  const { dayViewData, weekViewData, monthViewData, unfinishedItems } =
    useProcessedAgendaData(rawDays, viewMode, anchorDate);

  const dayHours = dayViewData?.hours ?? [];
  const flatListRef = useTimelineScroll(dayHours, 60, !loading && viewMode === 'day');

  const label = useMemo(() => getViewLabel(viewMode, anchorDate), [viewMode, anchorDate]);

  const navigation = useMemo(
    () => getNavigationDates(viewMode, anchorDate),
    [viewMode, anchorDate],
  );

  const loadAgendaData = useCallback(async (mode: AgendaViewMode, dateKey: string) => {
    try {
      setLoading(true);
      setViewError(null);
      const range = getDateRange(mode, dateKey);
      const response = await agendaApi.getAgendaItems({
        startDate: range.start,
        endDate: range.end,
      });
      setRawDays(response.items);
    } catch (error) {
      const viewError = error instanceof Error ? error : new Error('Failed to load agenda data');
      console.error('Failed to load agenda data:', viewError);
      setViewError(viewError);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAgendaData = useCallback(async () => {
    await loadAgendaData(viewMode, anchorDate);
    setLastRefreshTime(Date.now());
  }, [loadAgendaData, viewMode, anchorDate]);

  useEffect(() => {
    loadAgendaData(viewMode, anchorDate);
  }, [loadAgendaData, viewMode, anchorDate]);

  useEffect(() => {
    setSelectedDate(new Date(`${anchorDate}T00:00:00`));
  }, [anchorDate]);

  useAutoRefresh(['agenda_invalidated'], refreshAgendaData);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const cacheAge = now - lastRefreshTime;

      if (cacheAge > CACHE_FRESHNESS_MS) {
        refreshAgendaData();
      }
    }, [refreshAgendaData, lastRefreshTime])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAgendaData();
    setRefreshing(false);
  }, [refreshAgendaData]);

  const goToPrevious = useCallback(() => {
    haptics.medium();
    setAnchorDate(navigation.previous);
  }, [navigation, haptics]);

  const goToNext = useCallback(() => {
    haptics.medium();
    setAnchorDate(navigation.next);
  }, [navigation, haptics]);

  const goToToday = useCallback(() => {
    haptics.medium();
    setAnchorDate(navigation.today);
  }, [navigation, haptics]);

  const { panResponder, animatedStyle } = useSwipeGesture({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
    threshold: 100,
    enabled: !showTaskSelector && !showScheduleModal && !showCalendarPicker && !isDrawerOpen,
  });

  const handleAgendaItemPress = useCallback(
    (agendaItem: AgendaItemEnrichedDto) => {
      router.push(`/agenda/items/${agendaItem.agendaId}/${agendaItem.id}`);
    },
    [router]
  );

  const handleAgendaItemLongPress = useCallback(
    (agendaItem: AgendaItemEnrichedDto) => {
      haptics.medium();
      Alert.alert(
        agendaItem.task?.title || 'Agenda Item',
        'Choose an action',
        [
          {
            text: 'View Details',
            onPress: () => handleAgendaItemPress(agendaItem),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              haptics.warning();
              Alert.alert(
                'Delete Agenda Item',
                'Are you sure you want to delete this scheduled item?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        haptics.error();
                        await agendaApi.deleteAgendaItem(
                          agendaItem.agendaId,
                          agendaItem.id
                        );
                        await refreshAgendaData();
                      } catch (error) {
                        haptics.error();
                        console.error('Failed to delete agenda item:', error);
                        Alert.alert('Error', 'Failed to delete agenda item');
                      }
                    },
                  },
                ]
              );
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    },
    [handleAgendaItemPress, refreshAgendaData, haptics]
  );

  const handleToggleComplete = useCallback(
    async (agendaItem: AgendaItemEnrichedDto) => {
      try {
        if (agendaItem.status === 'COMPLETED') {
          haptics.light();
          await agendaApi.markAsUnfinished(agendaItem.agendaId, agendaItem.id);
        } else {
          haptics.success();
          await agendaApi.completeAgendaItem(agendaItem.agendaId, agendaItem.id);
        }
        await refreshAgendaData();
      } catch (error) {
        haptics.error();
        console.error('Failed to update agenda item status:', error);
        Alert.alert('Error', 'Failed to update agenda item status');
      }
    },
    [refreshAgendaData, haptics]
  );

  const handleTaskSelected = useCallback((task: TaskDto) => {
    setSelectedTask(task);
    setShowTaskSelector(false);
    setShowScheduleModal(true);
  }, []);

  const handleScheduleTask = useCallback(
    async (data: TaskScheduleData) => {
      try {
        await agendaApi.createAgendaItem({
          agendaId: data.date,
          taskId: data.taskId,
          type: data.taskType,
          scheduledTime: data.time || null,
          durationMinutes: data.durationMinutes || null,
        });

        await refreshAgendaData();
        setSelectedTask(null);
      } catch (error) {
        console.error('Failed to schedule task:', error);
        throw error;
      }
    },
    [refreshAgendaData]
  );

  const openCalendarPicker = useCallback(() => {
    haptics.light();
    setShowCalendarPicker(true);
  }, [haptics]);

  const handleCalendarDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setAnchorDate(formatDateKey(date));
    setShowCalendarPicker(false);
  }, []);

  const openTaskSelector = useCallback(() => {
    haptics.light();
    setShowTaskSelector(true);
  }, [haptics]);

  return {
    viewMode,
    setViewMode,
    anchorDate,
    setAnchorDate,
    selectedDate,
    label,
    dayViewData,
    weekViewData,
    monthViewData,
    unfinishedItems,
    refreshing,
    loading,
    viewError,
    showTaskSelector,
    setShowTaskSelector,
    showScheduleModal,
    setShowScheduleModal,
    showCalendarPicker,
    setShowCalendarPicker,
    selectedTask,
    setSelectedTask,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    flatListRef,
    panResponder,
    animatedStyle,
    goToPrevious,
    goToNext,
    goToToday,
    onRefresh,
    refreshAgendaData,
    handleAgendaItemPress,
    handleAgendaItemLongPress,
    handleToggleComplete,
    handleTaskSelected,
    handleScheduleTask,
    openCalendarPicker,
    handleCalendarDateSelect,
    openTaskSelector,
  };
}
