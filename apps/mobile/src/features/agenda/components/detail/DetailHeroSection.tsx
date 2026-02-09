import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import AppIcon from '@shared/components/icons/AppIcon';
import { OrphanedItemBadge } from '@shared/components/OrphanedItemBadge';
import { getItemTitle, isItemCompleted, isOrphanedItem } from '@features/agenda/utils/agendaHelpers';
import { getAccentColor, getTaskTypeMeta, getTaskTypeIcon } from '@features/agenda/utils/agendaFormatters';

interface DetailHeroSectionProps {
  item: AgendaItemEnrichedDto;
}

export const DetailHeroSection: React.FC<DetailHeroSectionProps> = ({ item }) => {
  const title = getItemTitle(item);
  const completed = isItemCompleted(item);
  const orphaned = isOrphanedItem(item);
  const accentColor = getAccentColor(item);
  const taskType = item.task?.taskType ?? null;
  const isRoutine = !!item.routineTaskId;
  const typeMeta = getTaskTypeMeta(taskType, isRoutine);
  const typeIcon = getTaskTypeIcon(taskType, isRoutine);

  return (
    <View style={styles.container}>
      <View style={styles.typeRow}>
        <View style={[styles.iconBox, { backgroundColor: accentColor + '22' }]}>
          <AppIcon name={typeIcon} size={20} color={accentColor} />
        </View>
        <View style={[styles.typeBadge, { backgroundColor: typeMeta.color + '22' }]}>
          <Text style={[styles.typeBadgeText, { color: typeMeta.color }]}>
            {typeMeta.label}
          </Text>
        </View>
        {completed && (
          <View style={styles.completedBadge}>
            <AppIcon name="check" size={12} color={theme.accent.success} />
            <Text style={styles.completedText}>Done</Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, completed && styles.titleCompleted]}>
        {title}
      </Text>

      {item.task?.description && (
        <Text style={styles.description} numberOfLines={3}>
          {item.task.description}
        </Text>
      )}

      {orphaned && (
        <View style={styles.orphanedRow}>
          <OrphanedItemBadge />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.accent.success + '22',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.accent.success,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text.primary,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.text.tertiary,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.text.secondary,
  },
  orphanedRow: {
    marginTop: 4,
  },
});
