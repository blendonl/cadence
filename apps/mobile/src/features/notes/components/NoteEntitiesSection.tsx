import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import EntityChip from '@shared/components/EntityChip';
import { ProjectId, BoardId, TaskId } from '@core/types';

interface NoteEntitiesSectionProps {
  selectedProjects: ProjectId[];
  selectedBoards: BoardId[];
  selectedTasks: TaskId[];
  entityNames: {
    projects: Map<string, string>;
    boards: Map<string, string>;
    tasks: Map<string, string>;
  };
  onAddEntity: () => void;
  onRemoveProject: (id: string) => void;
  onRemoveBoard: (id: string) => void;
  onRemoveTask: (id: string) => void;
}

export const NoteEntitiesSection: React.FC<NoteEntitiesSectionProps> = ({
  selectedProjects,
  selectedBoards,
  selectedTasks,
  entityNames,
  onAddEntity,
  onRemoveProject,
  onRemoveBoard,
  onRemoveTask,
}) => {
  return (
    <View style={styles.entitiesSection}>
      <Text style={styles.sectionLabel}>Connected To</Text>
      <View style={styles.entityChipsContainer}>
        {selectedProjects.map(id => (
          <EntityChip
            key={id}
            entityType="project"
            entityId={id}
            entityName={entityNames.projects.get(id) || id}
            onRemove={onRemoveProject}
          />
        ))}
        {selectedBoards.map(id => (
          <EntityChip
            key={id}
            entityType="board"
            entityId={id}
            entityName={entityNames.boards.get(id) || id}
            onRemove={onRemoveBoard}
          />
        ))}
        {selectedTasks.map(id => (
          <EntityChip
            key={id}
            entityType="task"
            entityId={id}
            entityName={entityNames.tasks.get(id) || id}
            onRemove={onRemoveTask}
          />
        ))}
        <TouchableOpacity
          style={styles.addEntityButton}
          onPress={onAddEntity}
        >
          <Text style={styles.addEntityButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  entitiesSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionLabel: {
    color: theme.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  entityChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  addEntityButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: theme.glass.tint.blue,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.accent.primary,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  addEntityButtonText: {
    color: theme.accent.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
