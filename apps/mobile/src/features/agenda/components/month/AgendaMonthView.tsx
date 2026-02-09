import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { spacing } from '@shared/theme/spacing';
import { theme } from '@shared/theme/colors';
import { getItemTitle, isItemCompleted } from '../../utils/agendaHelpers';
import { getAccentColor } from '../../utils/agendaFormatters';
import { MonthDayData } from '../../hooks/useProcessedAgendaData';
import { getWeekdayLabels } from '../../utils/dateRangeHelpers';

interface AgendaMonthViewProps {
  days: MonthDayData[];
  onDayPress: (dateKey: string) => void;
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
}

export const AgendaMonthView: React.FC<AgendaMonthViewProps> = ({
  days,
  onDayPress,
  onItemPress,
  onToggleComplete,
}) => {
  const weekdayLabels = useMemo(() => getWeekdayLabels(), []);

  return (
    <View style={styles.container}>
      <View style={styles.weekdayRow}>
        {weekdayLabels.map((label) => (
          <Text key={label} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((day) => (
          <MonthDayCell
            key={day.dateKey}
            day={day}
            onDayPress={onDayPress}
            onItemPress={onItemPress}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </View>
    </View>
  );
};

interface MonthDayCellProps {
  day: MonthDayData;
  onDayPress: (dateKey: string) => void;
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
}

const MonthDayCell: React.FC<MonthDayCellProps> = ({ day, onDayPress, onItemPress, onToggleComplete }) => {
  return (
    <TouchableOpacity
      style={[
        styles.dayCell,
        day.isToday && styles.dayCellToday,
        !day.isCurrentMonth && styles.dayCellOutside,
      ]}
      onPress={() => onDayPress(day.dateKey)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${day.dateKey}`}
    >
      <View style={styles.dayHeader}>
        <View style={[styles.dayNumberContainer, day.isToday && styles.dayNumberContainerToday]}>
          <Text
            style={[
              styles.dayNumber,
              day.isToday && styles.dayNumberToday,
              !day.isCurrentMonth && styles.dayNumberOutside,
            ]}
          >
            {day.label}
          </Text>
        </View>
      </View>
      <View style={styles.dayItems}>
        {day.items.map((item) => (
          <MonthItemChip key={item.id} item={item} onPress={() => onItemPress(item)} />
        ))}
        {day.overflowCount > 0 && (
          <Text style={styles.moreText}>{`+${day.overflowCount}`}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

interface MonthItemChipProps {
  item: AgendaItemEnrichedDto;
  onPress: () => void;
}

const MonthItemChip: React.FC<MonthItemChipProps> = ({ item, onPress }) => {
  const title = useMemo(() => getItemTitle(item), [item]);
  const accentColor = useMemo(() => getAccentColor(item), [item]);
  const completed = isItemCompleted(item);

  return (
    <TouchableOpacity
      style={[styles.itemChip, { borderLeftColor: accentColor }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {completed && <View style={[styles.completionDot, { backgroundColor: theme.accent.success }]} />}
      <Text
        style={[styles.itemText, completed && styles.itemTextCompleted]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  weekdayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    padding: 6,
    minHeight: 80,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: theme.background.secondary,
  },
  dayCellToday: {
    backgroundColor: 'rgba(79, 140, 255, 0.06)',
    borderColor: theme.accent.primary,
  },
  dayCellOutside: {
    backgroundColor: theme.background.elevated,
    opacity: 0.35,
  },
  dayHeader: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  dayNumberContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberContainerToday: {
    backgroundColor: theme.accent.primary,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text.primary,
  },
  dayNumberToday: {
    color: theme.background.primary,
  },
  dayNumberOutside: {
    color: theme.text.muted,
  },
  dayItems: {
    gap: 2,
  },
  itemChip: {
    backgroundColor: theme.card.background,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderLeftWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  completionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  itemText: {
    fontSize: 10,
    color: theme.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: theme.text.tertiary,
  },
  moreText: {
    fontSize: 9,
    color: theme.text.secondary,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
});
