import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '@shared/theme';
import { spacing } from '@shared/theme/spacing';
import { Note } from '@features/notes/domain/entities/Note';
import AppIcon, { AppIconName } from '@shared/components/icons/AppIcon';

interface EntityIndicatorsProps {
  note: Note;
  entityNames: {
    projects: Map<string, string>;
    boards: Map<string, string>;
    tasks: Map<string, string>;
  };
}

export const EntityIndicators: React.FC<EntityIndicatorsProps> = ({ note, entityNames }) => {
  const entities: { icon: AppIconName; name: string }[] = [];

  note.project_ids.slice(0, 1).forEach(id => {
    const name = entityNames.projects.get(id) || id;
    entities.push({ icon: 'folder' as AppIconName, name });
  });

  note.board_ids.slice(0, 1).forEach(id => {
    const name = entityNames.boards.get(id) || id;
    entities.push({ icon: 'board' as AppIconName, name });
  });

  const taskCount = note.task_ids.length;
  if (taskCount > 0) {
    entities.push({ icon: 'check', name: `${taskCount} task${taskCount > 1 ? 's' : ''}` });
  }

  const totalEntities = note.project_ids.length + note.board_ids.length + note.task_ids.length;
  const showing = entities.length;
  const remaining = totalEntities - showing;

  if (entities.length === 0) return null;

  return (
    <View style={styles.entityIndicators}>
      {entities.map((entity, index) => (
        <View key={`${entity.name}-${index}`} style={styles.entityIndicatorItem}>
          <AppIcon name={entity.icon} size={12} color={theme.text.tertiary} />
          <Text style={styles.entityIndicatorText}>{entity.name}</Text>
          {index < entities.length - 1 && (
            <Text style={styles.entityIndicatorSeparator}>•</Text>
          )}
        </View>
      ))}
      {remaining > 0 && (
        <Text style={styles.entityIndicatorText}>+{remaining} more</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  entityIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  entityIndicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: spacing.xs,
  },
  entityIndicatorText: {
    color: theme.text.tertiary,
    fontSize: 11,
  },
  entityIndicatorSeparator: {
    color: theme.text.tertiary,
    fontSize: 11,
    marginLeft: spacing.xs,
  },
});
