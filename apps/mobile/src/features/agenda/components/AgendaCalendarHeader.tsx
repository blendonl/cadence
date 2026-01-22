import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { ViewMode } from '../types/agenda-screen.types';

interface AgendaCalendarHeaderProps {
  headerDate: Date;
  viewMode: ViewMode;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onToggleViewMode: () => void;
  children?: React.ReactNode;
}

export function AgendaCalendarHeader({
  headerDate,
  viewMode,
  onPrevious,
  onNext,
  onToday,
  onToggleViewMode,
  children,
}: AgendaCalendarHeaderProps) {
  const monthLabel = headerDate.toLocaleDateString('en-US', { month: 'short' });
  const yearLabel = headerDate.toLocaleDateString('en-US', { year: 'numeric' });

  return (
    <View style={styles.calendarCard}>
      <View style={styles.calendarTopRow}>
        <TouchableOpacity onPress={onPrevious} style={styles.navButton}>
          <AppIcon name="arrow-left" size={16} color={theme.text.secondary} />
        </TouchableOpacity>
        <View style={styles.calendarTitleRow}>
          <TouchableOpacity onPress={onToday} style={styles.monthButton}>
            <Text style={styles.monthText}>{monthLabel}</Text>
            <Text style={styles.yearText}>{yearLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleButton, styles.viewToggleButtonActive]}
            onPress={onToggleViewMode}
          >
            <Text style={[styles.viewToggleText, styles.viewToggleTextActive]}>
              {viewMode === 'week' ? 'W' : 'M'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onNext} style={styles.navButton}>
          <AppIcon name="arrow-right" size={16} color={theme.text.secondary} />
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    backgroundColor: theme.background.secondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border.primary,
    paddingVertical: spacing.sm,
  },
  calendarTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  monthButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 80,
  },
  monthText: {
    color: theme.text.primary,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
  },
  yearText: {
    color: theme.text.secondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  viewToggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewToggleButtonActive: {
    backgroundColor: theme.accent.primary,
  },
  viewToggleText: {
    fontSize: 12,
    color: theme.text.secondary,
    fontWeight: '600',
  },
  viewToggleTextActive: {
    color: theme.background.primary,
    fontWeight: '700',
  },
});
