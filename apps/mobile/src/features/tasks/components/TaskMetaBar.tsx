import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Parent } from '@domain/entities/Parent';
import ParentBadge from '@shared/components/ParentBadge';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { getIssueTypeIcon } from '@utils/issueTypeUtils';
import { MetaPickerType, TaskColumnData } from '../types';

interface TaskMetaBarProps {
  priorityLabel: string;
  priorityColor: string;
  issueType: string;
  selectedParent: Parent | null;
  targetColumn: TaskColumnData | null;
  activeMetaPicker: MetaPickerType;
  onPriorityPress: () => void;
  onIssueTypePress: () => void;
  onParentPress: () => void;
}

export const TaskMetaBar: React.FC<TaskMetaBarProps> = ({
  priorityLabel,
  priorityColor,
  issueType,
  selectedParent,
  targetColumn,
  activeMetaPicker,
  onPriorityPress,
  onIssueTypePress,
  onParentPress,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          style={[
            styles.metaChip,
            activeMetaPicker === 'priority' && styles.metaChipActive,
          ]}
          onPress={onPriorityPress}
          activeOpacity={0.85}
        >
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          <Text style={styles.metaChipText}>Priority: {priorityLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.metaChip,
            activeMetaPicker === 'issueType' && styles.metaChipActive,
          ]}
          onPress={onIssueTypePress}
          activeOpacity={0.85}
        >
          <AppIcon
            name={getIssueTypeIcon(issueType)}
            size={16}
            color={theme.text.secondary}
          />
          <Text style={styles.metaChipText}>{issueType}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.metaChip}
          onPress={onParentPress}
          activeOpacity={0.85}
        >
          {selectedParent ? (
            <ParentBadge
              name={selectedParent.name}
              color={selectedParent.color}
              size="small"
            />
          ) : (
            <Text style={styles.metaChipText}>Parent: None</Text>
          )}
        </TouchableOpacity>

        {targetColumn && (
          <View style={styles.metaChipStatic}>
            <AppIcon name="stack" size={16} color={theme.text.secondary} />
            <Text style={styles.metaChipText}>{targetColumn.name}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  content: {
    gap: spacing.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: theme.glass.tint.neutral,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  metaChipActive: {
    borderColor: theme.accent.primary,
    backgroundColor: theme.accent.primary + '20',
  },
  metaChipStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: theme.glass.tint.neutral,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  metaChipText: {
    color: theme.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
