import React from 'react';
import { Animated } from 'react-native';
import { Screen } from '@shared/components/Screen';
import TaskSelectorModal from '@features/agenda/components/TaskSelectorModal';
import { TaskScheduleModal } from '@features/agenda/components/TaskScheduleModal';
import { AgendaUnifiedHeader } from '@features/agenda/components/header/AgendaUnifiedHeader';
import { CalendarPickerModal } from '@features/agenda/components/header/CalendarPickerModal';
import { LoadingSkeleton } from '@features/agenda/components/timeline/LoadingSkeleton';
import { WeekViewSkeleton } from '@features/agenda/components/week/WeekViewSkeleton';
import { MonthViewSkeleton } from '@features/agenda/components/month/MonthViewSkeleton';
import { UnfinishedTasksBadge } from '@features/agenda/components/unfinished/UnfinishedTasksBadge';
import { UnfinishedDrawer } from '@features/agenda/components/unfinished/UnfinishedDrawer';
import ErrorState from '@shared/components/ErrorState';
import { AgendaDayView } from '@features/agenda/components/views/AgendaDayView';
import { AgendaWeekView } from '@features/agenda/components/week/AgendaWeekView';
import { AgendaMonthView } from '@features/agenda/components/month/AgendaMonthView';
import { AgendaFAB } from '@features/agenda/components/AgendaFAB';
import { AgendaViewErrorBoundary } from '@features/agenda/components/AgendaViewErrorBoundary';
import { useAgendaScreen } from '@features/agenda/hooks/useAgendaScreen';
import { useViewTransition } from '@features/agenda/hooks/useViewTransition';

export default function AgendaScreen() {
  const {
    viewMode,
    setViewMode,
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
    anchorDate,
  } = useAgendaScreen();

  const { transitionStyle } = useViewTransition(viewMode, loading);

  if (viewError && !loading) {
    return (
      <Screen hasTabBar>
        <ErrorState
          type="network"
          title="Failed to Load Agenda"
          message="Unable to load your agenda right now."
          error={viewError}
          onRetry={() => refreshAgendaData()}
        />
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen hasTabBar>
        <AgendaUnifiedHeader
          label={label}
          viewMode={viewMode}
          onPreviousDay={goToPrevious}
          onNextDay={goToNext}
          onDatePress={openCalendarPicker}
          onTodayPress={goToToday}
          onViewModeChange={setViewMode}
        />
        {viewMode === 'day' && <LoadingSkeleton count={12} />}
        {viewMode === 'week' && <WeekViewSkeleton />}
        {viewMode === 'month' && <MonthViewSkeleton />}
      </Screen>
    );
  }

  return (
    <Screen hasTabBar>
      <AgendaUnifiedHeader
        label={label}
        viewMode={viewMode}
        onPreviousDay={goToPrevious}
        onNextDay={goToNext}
        onDatePress={openCalendarPicker}
        onTodayPress={goToToday}
        onViewModeChange={setViewMode}
      />

      <Animated.View style={[{ flex: 1 }, animatedStyle, transitionStyle]} {...panResponder.panHandlers}>
        <AgendaViewErrorBoundary onRecover={refreshAgendaData}>
          {viewMode === 'day' && dayViewData && (
            <AgendaDayView
              data={dayViewData}
              label={label}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onScheduleTask={openTaskSelector}
              onItemPress={handleAgendaItemPress}
              onItemLongPress={handleAgendaItemLongPress}
              onToggleComplete={handleToggleComplete}
              flatListRef={flatListRef}
            />
          )}
          {viewMode === 'week' && weekViewData && (
            <AgendaWeekView
              days={weekViewData}
              onItemPress={handleAgendaItemPress}
              onItemLongPress={handleAgendaItemLongPress}
              onToggleComplete={handleToggleComplete}
              onDayPress={(dateKey) => setAnchorDate(dateKey)}
            />
          )}
          {viewMode === 'month' && monthViewData && (
            <AgendaMonthView
              days={monthViewData}
              onDayPress={(dateKey) => setAnchorDate(dateKey)}
              onItemPress={handleAgendaItemPress}
              onToggleComplete={handleToggleComplete}
            />
          )}
        </AgendaViewErrorBoundary>
      </Animated.View>

      <AgendaFAB onPress={openTaskSelector} />

      <UnfinishedTasksBadge
        count={unfinishedItems.length}
        onPress={openDrawer}
      />

      <CalendarPickerModal
        visible={showCalendarPicker}
        selectedDate={selectedDate}
        onClose={() => setShowCalendarPicker(false)}
        onDateSelect={handleCalendarDateSelect}
      />

      <UnfinishedDrawer
        isOpen={isDrawerOpen}
        items={unfinishedItems}
        onClose={closeDrawer}
        onItemPress={handleAgendaItemPress}
        onItemLongPress={handleAgendaItemLongPress}
        onToggleComplete={handleToggleComplete}
      />

      <TaskSelectorModal
        visible={showTaskSelector}
        onClose={() => setShowTaskSelector(false)}
        onTaskSelected={handleTaskSelected}
      />

      <TaskScheduleModal
        visible={showScheduleModal}
        task={selectedTask}
        prefilledDate={anchorDate}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedTask(null);
        }}
        onSubmit={handleScheduleTask}
      />
    </Screen>
  );
}
