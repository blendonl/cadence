import { useEffect, useCallback } from 'react';
import { formatDateKey, getMonthStart, getMonthEnd } from '@shared/utils/date.utils';
import { useAgendaData } from './useAgendaData';
import { useUnfinishedItems } from './useUnfinishedItems';
import { useAgendaSearch } from './useAgendaSearch';
import { useAgendaNavigation } from './useAgendaNavigation';
import { useAgendaRefresh } from './useAgendaRefresh';
import { useAgendaModals } from './useAgendaModals';
import { useAgendaActions } from './useAgendaActions';
import { useAgendaItemHandlers } from './useAgendaItemHandlers';
import { useProjects } from '@features/projects/hooks/useProjects';
import { useGoals } from '@features/goals/hooks/useGoals';

export function useAgendaScreen() {
  // Sub-hooks
  const navigation = useAgendaNavigation();
  const modals = useAgendaModals();
  const { agendaData, loading: agendaLoading, loadData, updateSingleDay } = useAgendaData();
  const { unfinishedItems, loadUnfinished } = useUnfinishedItems();
  const search = useAgendaSearch();
  const projects = useProjects();
  const goals = useGoals();

  // Business logic - load current view
  const loadCurrentView = useCallback(async () => {
    const { viewMode, weekStart, monthAnchor } = navigation;
    let startDateStr: string;
    let endDateStr: string;

    if (viewMode === 'week') {
      startDateStr = formatDateKey(weekStart);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      endDateStr = formatDateKey(weekEnd);
    } else {
      const monthStart = getMonthStart(monthAnchor);
      const monthEnd = getMonthEnd(monthAnchor);
      startDateStr = formatDateKey(monthStart);
      endDateStr = formatDateKey(monthEnd);
    }

    await loadData(startDateStr, endDateStr);
  }, [navigation.viewMode, navigation.weekStart, navigation.monthAnchor, loadData]);

  // Business logic - refresh all
  const refreshAll = useCallback(async () => {
    await Promise.all([loadCurrentView(), loadUnfinished()]);
  }, [loadCurrentView, loadUnfinished]);

  // Data change handler
  const handleDataChanged = useCallback(async (date?: string) => {
    if (date) await updateSingleDay(date);
    await loadUnfinished();
  }, [updateSingleDay, loadUnfinished]);

  // Actions with data refresh
  const actions = useAgendaActions({ onDataChanged: handleDataChanged });
  const itemHandlers = useAgendaItemHandlers({
    onToggleComplete: actions.handleToggleComplete,
    onDelete: actions.handleDelete,
  });

  const handleCreateAgendaItem = useCallback(async (data: any) => {
    await actions.handleCreate(data);
    await refreshAll();
  }, [actions, refreshAll]);

  const handleTaskSelected = useCallback(() => {
    modals.openTaskSelectorThenForm();
  }, [modals]);

  // Refresh setup
  const { refreshing, performRefresh } = useAgendaRefresh({ onRefresh: refreshAll });

  // Initial load
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        loadCurrentView(),
        loadUnfinished(),
        projects.loadProjects(),
        goals.loadGoals(),
      ]);
    };
    init();
  }, []);

  // Reload when view changes
  useEffect(() => {
    loadCurrentView();
  }, [navigation.viewMode, navigation.weekStart, navigation.monthAnchor]);

  // Return clean interface for component
  return {
    // View state
    viewState: {
      selectedDate: navigation.selectedDate,
      weekStart: navigation.weekStart,
      monthAnchor: navigation.monthAnchor,
      viewMode: navigation.viewMode,
      loading: agendaLoading,
      refreshing,
    },

    // Data
    data: {
      agendaData,
      unfinishedItems,
      searchResults: search.searchResults,
      projects: projects.projects,
      goals: goals.goals,
    },

    // Search
    search: {
      query: search.searchQuery,
      mode: search.searchMode,
      loading: search.loading,
      setQuery: search.setSearchQuery,
      setMode: search.setSearchMode,
    },

    // Modals
    modals: {
      showFormModal: modals.showFormModal,
      showTaskSelector: modals.showTaskSelector,
      openFormModal: modals.openFormModal,
      closeFormModal: modals.closeFormModal,
      openTaskSelector: modals.openTaskSelector,
      closeTaskSelector: modals.closeTaskSelector,
    },

    // Navigation actions
    navigation: {
      setSelectedDate: navigation.setSelectedDate,
      setMonthAnchor: navigation.setMonthAnchor,
      goToPreviousWeek: navigation.goToPreviousWeek,
      goToNextWeek: navigation.goToNextWeek,
      goToPreviousMonth: navigation.goToPreviousMonth,
      goToNextMonth: navigation.goToNextMonth,
      goToToday: navigation.goToToday,
      toggleViewMode: navigation.toggleViewMode,
    },

    // Item actions
    itemActions: {
      onItemPress: itemHandlers.handleItemPress,
      onItemLongPress: itemHandlers.handleItemLongPress,
      onToggleComplete: itemHandlers.handleToggleComplete,
    },

    // Form actions
    formActions: {
      onCreateAgendaItem: handleCreateAgendaItem,
      onTaskSelected: handleTaskSelected,
      onLoadBoards: actions.handleLoadBoards,
      onLoadMoreProjects: projects.loadMore,
      projectsHasMore: projects.hasMore,
      projectsLoading: projects.loading,
    },

    // Refresh
    onRefresh: performRefresh,
  };
}
