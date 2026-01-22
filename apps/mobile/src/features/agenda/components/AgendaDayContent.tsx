import React, { useCallback, useMemo } from 'react';
import { View, Text, SectionList, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { DayAgenda, ScheduledAgendaItem } from '../domain/interfaces/AgendaService.interface';
import { AgendaSection } from '../types/agenda-screen.types';
import { AgendaItemCard } from './AgendaItemCard';
import { formatDateKey, formatSearchDateLabel } from '@shared/utils/date.utils';

interface AgendaDayContentProps {
  selectedDate: Date;
  agendaData: DayAgenda[];
  unfinishedItems: ScheduledAgendaItem[];
  searchResults: ScheduledAgendaItem[];
  isSearching: boolean;
  searchLoading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onItemPress: (item: ScheduledAgendaItem) => void;
  onItemLongPress: (item: ScheduledAgendaItem) => void;
  onToggleComplete: (item: ScheduledAgendaItem) => void;
  onScheduleTask: () => void;
}

export function AgendaDayContent({
  selectedDate,
  agendaData,
  unfinishedItems,
  searchResults,
  isSearching,
  searchLoading,
  refreshing,
  onRefresh,
  onItemPress,
  onItemLongPress,
  onToggleComplete,
  onScheduleTask,
}: AgendaDayContentProps) {
  const renderAgendaItem = useCallback(({ item }: { item: ScheduledAgendaItem }) => (
    <AgendaItemCard
      scheduledItem={item}
      onPress={() => onItemPress(item)}
      onLongPress={() => onItemLongPress(item)}
      onToggleComplete={() => onToggleComplete(item)}
    />
  ), [onItemPress, onItemLongPress, onToggleComplete]);

  const renderSectionHeader = useCallback(({ section }: { section: AgendaSection }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionIcon}>
          <AppIcon name={section.icon} size={14} color={theme.text.secondary} />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.sectionCountPill}>
          <Text style={styles.sectionCountText}>{section.data.length}</Text>
        </View>
      </View>
    </View>
  ), []);

  const searchSections = useMemo(() => {
    const grouped = new Map<string, ScheduledAgendaItem[]>();
    searchResults.forEach(item => {
      const dateKey = item.agendaItem.scheduled_date;
      const existing = grouped.get(dateKey) || [];
      existing.push(item);
      grouped.set(dateKey, existing);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, items]) => ({
        title: formatSearchDateLabel(dateKey),
        data: items.sort((left, right) => {
          const leftTime = left.agendaItem.scheduled_time || '';
          const rightTime = right.agendaItem.scheduled_time || '';
          return leftTime.localeCompare(rightTime);
        }),
      }));
  }, [searchResults]);

  if (isSearching) {
    if (searchLoading) {
      return (
        <View style={styles.searchLoading}>
          <ActivityIndicator size="small" color={theme.accent.primary} />
          <Text style={styles.searchLoadingText}>Searching...</Text>
        </View>
      );
    }

    if (searchSections.length === 0) {
      return (
        <View style={styles.searchEmpty}>
          <AppIcon name="search" size={26} color={theme.text.muted} />
          <Text style={styles.searchEmptyTitle}>No matching tasks</Text>
          <Text style={styles.searchEmptySubtitle}>Try a project, goal, or task name.</Text>
        </View>
      );
    }

    return (
      <SectionList
        sections={searchSections}
        keyExtractor={(item) => item.agendaItem.id}
        renderItem={renderAgendaItem}
        renderSectionHeader={({ section }) => (
          <View style={styles.searchSectionHeader}>
            <Text style={styles.searchSectionText}>{section.title}</Text>
            <View style={styles.searchSectionPill}>
              <Text style={styles.searchSectionCount}>{section.data.length}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.dayListContent}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent.primary}
          />
        }
      />
    );
  }

  const dayAgenda = agendaData.find(d => d.date === formatDateKey(selectedDate));
  const selectedDateStr = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const timeBlocks = (dayAgenda?.items || []).filter(
    item => item.agendaItem.scheduled_time && !item.agendaItem.is_unfinished
  );
  const allDayTasks = (dayAgenda?.items || []).filter(
    item => !item.agendaItem.scheduled_time || item.agendaItem.is_all_day
  );

  if (!dayAgenda || (dayAgenda.items.length === 0 && unfinishedItems.length === 0)) {
    return (
      <View style={styles.emptyDay}>
        <AppIcon name="calendar" size={28} color={theme.text.muted} />
        <Text style={styles.emptyTitle}>No tasks scheduled</Text>
        <Text style={styles.emptySubtitle}>{selectedDateStr}</Text>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={onScheduleTask}
        >
          <Text style={styles.scheduleButtonText}>+ Schedule a task</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections: AgendaSection[] = [
    { title: 'Unfinished', icon: 'alert-circle', data: unfinishedItems },
    { title: 'Time Blocks', icon: 'clock', data: timeBlocks },
    { title: 'All Day', icon: 'sun', data: allDayTasks },
  ].filter(section => section.data.length > 0);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.agendaItem.id}
      renderItem={renderAgendaItem}
      renderSectionHeader={renderSectionHeader}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      ListHeaderComponent={(
        <View style={styles.dayHeader}>
          <View style={styles.dayHeaderRow} />
        </View>
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.accent.primary}
        />
      }
      contentContainerStyle={styles.dayListContent}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  dayListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  dayHeader: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIcon: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: theme.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  sectionCountPill: {
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sectionCountText: {
    color: theme.text.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyDay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    color: theme.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    color: theme.text.secondary,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  scheduleButton: {
    backgroundColor: theme.accent.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  scheduleButtonText: {
    color: theme.background.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  searchLoading: {
    paddingTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchLoadingText: {
    color: theme.text.secondary,
    fontSize: 12,
  },
  searchEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  searchEmptyTitle: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  searchEmptySubtitle: {
    color: theme.text.secondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  searchSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  searchSectionText: {
    color: theme.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  searchSectionPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: theme.background.elevated,
  },
  searchSectionCount: {
    color: theme.text.muted,
    fontSize: 11,
    fontWeight: '600',
  },
});
