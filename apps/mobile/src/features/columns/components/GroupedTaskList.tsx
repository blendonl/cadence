import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { Task } from '@features/tasks/domain/entities/Task';
import { Parent } from '@domain/entities/Parent';
import ParentGroup from '@shared/components/ParentGroup';
import theme from '@shared/theme';

interface GroupedTasksData {
  parentId: string | null;
  parent: Parent | null;
  tasks: Task[];
  taskCount: number;
}

interface GroupedTaskListProps {
  groups: GroupedTasksData[];
  onTaskPress: (task: Task) => void;
  onDragStart?: (task: Task) => void;
  onDragEnd?: (taskId: string, targetColumnId: string | null) => void;
}

const GroupedTaskList: React.FC<GroupedTaskListProps> = React.memo(({
  groups,
  onTaskPress,
  onDragStart,
  onDragEnd,
}) => {
  const renderGroup: ListRenderItem<GroupedTasksData> = useCallback(
    ({ item: group }) => (
      <ParentGroup
        parent={group.parent}
        tasks={group.tasks}
        onTaskPress={onTaskPress}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    ),
    [onTaskPress, onDragStart, onDragEnd]
  );

  const keyExtractor = useCallback(
    (group: GroupedTasksData) => group.parentId || 'orphaned',
    []
  );

  return (
    <FlatList
      data={groups}
      renderItem={renderGroup}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
    />
  );
});

GroupedTaskList.displayName = 'GroupedTaskList';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.sm,
  },
});

export default GroupedTaskList;
