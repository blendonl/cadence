import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Screen } from '@shared/components/Screen';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { formatDateKey, getMonthStart } from '@shared/utils/date.utils';

import { useAgendaScreen } from '@features/agenda/hooks/useAgendaScreen';
import { AgendaCalendarHeader } from '@features/agenda/components/AgendaCalendarHeader';
import { WeekView } from '@features/agenda/components/WeekView';
import { MonthView } from '@features/agenda/components/MonthView';
import { AgendaSearchBar } from '@features/agenda/components/AgendaSearchBar';
import { AgendaDayContent } from '@features/agenda/components/AgendaDayContent';
import { AgendaFAB } from '@features/agenda/components/AgendaFAB';
import { TaskScheduleModal } from '@features/agenda/components/TaskScheduleModal';
import TaskSelectorModal from '@features/agenda/components/TaskSelectorModal';

export default function AgendaScreen() {
  const {
    viewState,
    data,
    search,
    modals,
    navigation,
    itemActions,
    formActions,
    onRefresh,
  } = useAgendaScreen();

  if (data.agendaData.length === 0 && viewState.loading) {
    return (
      <Screen hasTabBar>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent.primary} />
          <Text style={styles.loadingText}>Loading agenda...</Text>
        </View>
      </Screen>
    );
  }

  const headerDate = viewState.viewMode === 'month' ? viewState.monthAnchor : viewState.selectedDate;
  const goPrev = viewState.viewMode === 'month' ? navigation.goToPreviousMonth : navigation.goToPreviousWeek;
  const goNext = viewState.viewMode === 'month' ? navigation.goToNextMonth : navigation.goToNextWeek;

  return (
    <Screen hasTabBar>
      <AgendaCalendarHeader
        headerDate={headerDate}
        viewMode={viewState.viewMode}
        onPrevious={goPrev}
        onNext={goNext}
        onToday={navigation.goToToday}
        onToggleViewMode={navigation.toggleViewMode}
      >
        {viewState.viewMode === 'week' ? (
          <WeekView
            weekStart={viewState.weekStart}
            selectedDate={viewState.selectedDate}
            agendaData={data.agendaData}
            onDateSelect={navigation.setSelectedDate}
          />
        ) : (
          <MonthView
            monthAnchor={viewState.monthAnchor}
            selectedDate={viewState.selectedDate}
            agendaData={data.agendaData}
            loading={viewState.loading}
            onDateSelect={navigation.setSelectedDate}
            onMonthChange={(date) => navigation.setMonthAnchor(getMonthStart(date))}
          />
        )}
      </AgendaCalendarHeader>

      <AgendaSearchBar
        searchQuery={search.query}
        onSearchQueryChange={search.setQuery}
        searchMode={search.mode}
        onSearchModeChange={search.setMode}
      />

      <AgendaDayContent
        selectedDate={viewState.selectedDate}
        agendaData={data.agendaData}
        unfinishedItems={data.unfinishedItems}
        searchResults={data.searchResults}
        isSearching={search.query.trim().length > 0}
        searchLoading={search.loading}
        refreshing={viewState.refreshing}
        onRefresh={onRefresh}
        onItemPress={itemActions.onItemPress}
        onItemLongPress={itemActions.onItemLongPress}
        onToggleComplete={itemActions.onToggleComplete}
        onScheduleTask={modals.openTaskSelector}
      />

      <AgendaFAB onPress={modals.openTaskSelector} />

      <TaskSelectorModal
        visible={modals.showTaskSelector}
        onClose={modals.closeTaskSelector}
        onTaskSelected={formActions.onTaskSelected}
      />

      <TaskScheduleModal
        visible={modals.showScheduleModal}
        task={modals.selectedTask}
        prefilledDate={formatDateKey(viewState.selectedDate)}
        onClose={modals.closeScheduleModal}
        onSubmit={formActions.onScheduleTask}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.text.secondary,
    marginTop: spacing.md,
  },
});
