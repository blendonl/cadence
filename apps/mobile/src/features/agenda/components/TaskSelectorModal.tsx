import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import BaseModal from '@shared/components/BaseModal';
import theme from '@shared/theme';
import AppIcon from '@shared/components/icons/AppIcon';
import { getAgendaService } from '@core/di/hooks';
import { Task } from '@features/tasks';

interface TaskSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onTaskSelected: (task: Task) => void;
}

type FilterType = 'all' | 'priority';

export default function TaskSelectorModal({
  visible,
  onClose,
  onTaskSelected,
}: TaskSelectorModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  useEffect(() => {
    applyFilters();
  }, [tasks, selectedPriority]);

  const loadData = async () => {
    setLoading(true);
    try {
      const agendaService = getAgendaService();
      const allTasks = await agendaService.getAllSchedulableTasks(searchQuery);
      setTasks(allTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (selectedPriority) {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    setFilteredTasks(filtered);
  };

  const handleTaskPress = (task: Task) => {
    onTaskSelected(task);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.status.error;
      case 'medium': return theme.status.warning;
      case 'low': return theme.status.info;
      default: return theme.text.secondary;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'alert-circle';
      case 'medium': return 'alert-triangle';
      case 'low': return 'info';
      default: return 'minus';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'None';
    }
  };

  const renderTask = ({ item }: { item: Task }) => {
    const priorityColor = getPriorityColor(item.priority);
    return (
      <TouchableOpacity
        style={styles.taskItem}
        onPress={() => handleTaskPress(item)}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleRow}>
            <View style={[styles.priorityBadge, { borderColor: priorityColor, backgroundColor: `${priorityColor}22` }]}>
              <AppIcon
                name={getPriorityIcon(item.priority)}
                size={12}
                color={priorityColor}
              />
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {getPriorityLabel(item.priority)}
              </Text>
            </View>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
        </View>
        <Text style={styles.taskMeta} numberOfLines={1}>
          {item.slug || 'No project'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFilterChips = () => (
    <View style={styles.filterChipsContainer}>
      <TouchableOpacity
        style={[
          styles.filterChip,
          selectedFilter === 'all' && styles.filterChipActive,
        ]}
        onPress={() => {
          setSelectedFilter('all');
          setSelectedPriority(null);
        }}
      >
        <Text
          style={[
            styles.filterChipText,
            selectedFilter === 'all' && styles.filterChipTextActive,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterChip,
          selectedFilter === 'priority' && styles.filterChipActive,
        ]}
        onPress={() => setSelectedFilter('priority')}
      >
        <Text
          style={[
            styles.filterChipText,
            selectedFilter === 'priority' && styles.filterChipTextActive,
          ]}
        >
          Priority
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterOptions = () => {
    if (selectedFilter === 'priority') {
      return (
        <View style={styles.filterOptionsContainer}>
          {['high', 'medium', 'low', 'none'].map(priority => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.filterOption,
                selectedPriority === priority && styles.filterOptionActive,
              ]}
              onPress={() => setSelectedPriority(selectedPriority === priority ? null : priority)}
            >
              <AppIcon
                name={getPriorityIcon(priority)}
                size={14}
                color={getPriorityColor(priority)}
              />
              <Text style={styles.filterOptionText}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Select Task to Schedule"
      scrollable={false}
    >
      <View style={styles.searchContainer}>
        <AppIcon name="search" size={18} color={theme.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={theme.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersCard}>
        {renderFilterChips()}
        {renderFilterOptions()}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppIcon name="inbox" size={48} color={theme.text.secondary} />
          <Text style={styles.emptyText}>No tasks found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.input.background,
    borderRadius: theme.radius.input,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.input.border,
  },
  searchInput: {
    flex: 1,
    color: theme.text.primary,
    fontSize: theme.typography.fontSizes.base,
  },
  filtersCard: {
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  filterChipActive: {
    backgroundColor: theme.accent.primary,
    borderColor: theme.accent.primary,
  },
  filterChipText: {
    color: theme.text.secondary,
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: theme.background.primary,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  filterOptionActive: {
    backgroundColor: theme.accent.primary + '1F',
    borderColor: theme.accent.primary,
  },
  filterOptionText: {
    color: theme.text.secondary,
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: '600',
  },
  list: {
    maxHeight: 400,
  },
  listContent: {
    gap: theme.spacing.sm,
  },
  taskItem: {
    padding: theme.spacing.md,
    backgroundColor: theme.card.background,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  taskHeader: {
    marginBottom: theme.spacing.xs,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: '700',
  },
  taskTitle: {
    ...theme.typography.textStyles.body,
    color: theme.text.primary,
    flex: 1,
  },
  taskMeta: {
    ...theme.typography.textStyles.caption,
    color: theme.text.secondary,
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.textStyles.body,
    color: theme.text.secondary,
  },
});
