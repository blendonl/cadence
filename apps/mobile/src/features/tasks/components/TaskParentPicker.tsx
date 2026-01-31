import React from 'react';
import { StyleSheet } from 'react-native';
import { TaskDto } from 'shared-types';
import { Screen } from '@shared/components/Screen';
import { TaskParentPickerHeader } from './TaskParentPickerHeader';
import { TaskParentPickerLoading } from './TaskParentPickerLoading';
import { TaskParentPickerEmpty } from './TaskParentPickerEmpty';
import { TaskParentPickerNoneOption } from './TaskParentPickerNoneOption';
import { TaskParentPickerItem } from './TaskParentPickerItem';
import theme from '@shared/theme/colors';

interface TaskParentPickerProps {
  tasks: TaskDto[];
  loading: boolean;
  selectedParentId: string | null;
  onSelect: (parentId: string | null) => void;
  onClose: () => void;
}

export const TaskParentPicker: React.FC<TaskParentPickerProps> = ({
  tasks,
  loading,
  selectedParentId,
  onSelect,
  onClose,
}) => {
  const handleSelect = (parentId: string | null) => {
    onSelect(parentId);
    onClose();
  };

  return (
    <Screen style={styles.container} scrollable hasTabBar={false}>
      <TaskParentPickerHeader onClose={onClose} />

      {loading ? (
        <TaskParentPickerLoading />
      ) : (
        <>
          <TaskParentPickerNoneOption
            isSelected={selectedParentId === null}
            onSelect={() => handleSelect(null)}
          />

          {tasks.map((task) => (
            <TaskParentPickerItem
              key={task.id}
              task={task}
              isSelected={selectedParentId === task.id}
              onSelect={() => handleSelect(task.id)}
            />
          ))}

          {tasks.length === 0 && <TaskParentPickerEmpty />}
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
});
