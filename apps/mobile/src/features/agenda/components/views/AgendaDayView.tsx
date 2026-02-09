import React from 'react';
import { FlatList } from 'react-native';
import { AgendaDayHourSlotDto, AgendaItemEnrichedDto } from 'shared-types';
import { AgendaTimelineView } from '../timeline/AgendaTimelineView';
import { Timeline24Hour } from '../timeline/Timeline24Hour';
import { SpecialItemsHeader } from '../sections/SpecialItemsHeader';
import { AllDaySection } from '../sections/AllDaySection';
import { DayViewData } from '../../hooks/useProcessedAgendaData';

interface AgendaDayViewProps {
  data: DayViewData;
  label: string;
  refreshing: boolean;
  onRefresh: () => void;
  onScheduleTask: () => void;
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onItemLongPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
  flatListRef?: React.RefObject<FlatList<AgendaDayHourSlotDto> | null>;
}

export const AgendaDayView: React.FC<AgendaDayViewProps> = ({
  data,
  label,
  refreshing,
  onRefresh,
  onScheduleTask,
  onItemPress,
  onItemLongPress,
  onToggleComplete,
  flatListRef,
}) => {
  return (
    <AgendaTimelineView
      isEmpty={data.isEmpty}
      emptyStateLabel={label}
      emptyStateIsToday={data.isToday}
      onScheduleTask={onScheduleTask}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <Timeline24Hour
        slots={data.hours}
        onItemPress={onItemPress}
        onToggleComplete={onToggleComplete}
        flatListRef={flatListRef}
        isToday={data.isToday}
        wakeUpHour={data.wakeUpHour ?? undefined}
        sleepHour={data.sleepHour ?? undefined}
        refreshing={refreshing}
        onRefresh={onRefresh}
        headerComponent={
          <>
            <SpecialItemsHeader
              wakeupItem={data.wakeup}
              stepItem={data.step}
              onItemPress={onItemPress}
              onItemLongPress={onItemLongPress}
              onToggleComplete={onToggleComplete}
            />
            <AllDaySection
              items={data.allDayItems}
              onItemPress={onItemPress}
              onToggleComplete={onToggleComplete}
            />
          </>
        }
      />
    </AgendaTimelineView>
  );
};
