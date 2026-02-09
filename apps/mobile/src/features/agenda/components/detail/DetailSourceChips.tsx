import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import AppIcon from '@shared/components/icons/AppIcon';
import { isOrphanedItem } from '@features/agenda/utils/agendaHelpers';

interface DetailSourceChipsProps {
  item: AgendaItemEnrichedDto;
  onNavigateToTask: () => void;
}

export const DetailSourceChips: React.FC<DetailSourceChipsProps> = ({ item, onNavigateToTask }) => {
  const isRoutine = !!item.routineTaskId;
  const orphaned = isOrphanedItem(item);
  const chips: { label: string; icon?: 'folder' | 'board' | 'list' | 'shuffle' }[] = [];

  if (isRoutine && item.routineTask) {
    chips.push({ label: item.routineTask.routineName, icon: 'shuffle' });
    chips.push({ label: item.routineTask.routineType });
  } else {
    if (item.task?.projectName) chips.push({ label: item.task.projectName, icon: 'folder' });
    if (item.task?.boardName) chips.push({ label: item.task.boardName, icon: 'board' });
    if (item.task?.columnName) chips.push({ label: item.task.columnName, icon: 'list' });
  }

  if (chips.length === 0 && !item.taskId) return null;

  return (
    <View style={styles.container}>
      {chips.map((chip, index) => (
        <View key={index} style={styles.chip}>
          {chip.icon && <AppIcon name={chip.icon} size={12} color={theme.text.secondary} />}
          <Text style={styles.chipText}>{chip.label}</Text>
        </View>
      ))}
      {item.taskId && !orphaned && (
        <TouchableOpacity
          style={[styles.chip, styles.actionChip]}
          onPress={onNavigateToTask}
          activeOpacity={0.7}
        >
          <Text style={styles.actionChipText}>View Task</Text>
          <AppIcon name="arrow-right" size={12} color={theme.accent.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  actionChip: {
    borderColor: theme.accent.primary + '44',
    backgroundColor: theme.accent.primary + '14',
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.accent.primary,
  },
});
