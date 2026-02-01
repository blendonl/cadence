import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { agendaApi } from '@features/agenda/api/agendaApi';
import { AgendaItemEnrichedDto } from 'shared-types';
import { OrphanedItemBadge } from '@shared/components/OrphanedItemBadge';
import { theme } from '@shared/theme/colors';
import AppIcon from '@shared/components/icons/AppIcon';
import {
  getDurationMinutes,
  getItemTitle,
  getScheduledDate,
  getScheduledTime,
  isOrphanedItem,
  isItemCompleted,
} from '@features/agenda/utils/agendaHelpers';

import { Screen } from '@shared/components/Screen';

export default function AgendaItemDetailScreen() {
  const router = useRouter();
  const { agendaId: agendaIdParam, itemId: itemIdParam } = useLocalSearchParams<{
    agendaId?: string | string[];
    itemId?: string | string[];
  }>();
  const agendaId = Array.isArray(agendaIdParam) ? agendaIdParam[0] : agendaIdParam;
  const itemId = Array.isArray(itemIdParam) ? itemIdParam[0] : itemIdParam;
  const [loading, setLoading] = useState(true);
  const [agendaItem, setAgendaItem] = useState<AgendaItemEnrichedDto | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAgendaItem();
  }, [agendaId, itemId]);

  const loadAgendaItem = async () => {
    if (!agendaId || !itemId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const item = await agendaApi.getAgendaItemById(agendaId, itemId);

      if (!item) {
        Alert.alert('Error', 'Agenda item not found');
        router.back();
        return;
      }

      setAgendaItem(item);
      setNotes(item.notes || '');
    } catch (error) {
      console.error('Failed to load agenda item:', error);
      Alert.alert('Error', 'Failed to load agenda item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Agenda Item',
      'Are you sure you want to delete this agenda item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await agendaApi.deleteAgendaItem(agendaItem!.agendaId, agendaItem!.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete agenda item');
            }
          },
        },
      ]
    );
  };

  const handleReschedule = () => {
    const scheduledDate = agendaItem ? getScheduledDate(agendaItem) : undefined;
    const scheduledTime = agendaItem ? getScheduledTime(agendaItem) : null;
    const durationMinutes = agendaItem ? getDurationMinutes(agendaItem) : null;
    Alert.prompt(
      'Reschedule',
      'Enter new date (YYYY-MM-DD):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reschedule',
          onPress: async (newDate) => {
            if (!newDate) return;
            try {
              await agendaApi.rescheduleAgendaItem(
                agendaItem!.agendaId,
                agendaItem!.id,
                newDate,
                scheduledTime,
                durationMinutes
              );
              await loadAgendaItem();
              Alert.alert('Success', 'Agenda item rescheduled');
            } catch (error) {
              Alert.alert('Error', 'Failed to reschedule');
            }
          },
        },
      ],
      'plain-text',
      scheduledDate
    );
  };

  const handleSaveNotes = async () => {
    try {
      await agendaApi.updateAgendaItem(agendaItem!.agendaId, agendaItem!.id, { notes });

      setIsEditingNotes(false);
      Alert.alert('Success', 'Notes saved');
    } catch (error) {
      Alert.alert('Error', 'Failed to save notes');
    }
  };

  const handleToggleComplete = async () => {
    try {
      if (isItemCompleted(agendaItem!)) {
        await agendaApi.markAsUnfinished(agendaItem!.agendaId, agendaItem!.id);
      } else {
        await agendaApi.completeAgendaItem(agendaItem!.agendaId, agendaItem!.id);
      }
      await loadAgendaItem();
    } catch (error) {
      Alert.alert('Error', 'Failed to update completion status');
    }
  };

  const handleNavigateToTask = () => {
    const isOrphaned = agendaItem ? isOrphanedItem(agendaItem) : true;
    if (agendaItem?.taskId && !isOrphaned) {
      const boardId = agendaItem.task?.boardId;
      const query = boardId ? `?boardId=${boardId}` : '';
      router.push(`/tasks/${agendaItem.taskId}${query}`);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return 'No time set';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'No duration';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent.primary} />
      </View>
    );
  }

  if (!agendaItem) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {agendaId && itemId ? 'Agenda item not found' : 'Missing agenda item'}
        </Text>
      </View>
    );
  }

  const title = getItemTitle(agendaItem) || agendaItem.taskId || 'Agenda item';
  const isCompleted = isItemCompleted(agendaItem);
  const isOrphaned = isOrphanedItem(agendaItem);
  const scheduledDate = getScheduledDate(agendaItem);
  const scheduledTime = getScheduledTime(agendaItem);
  const durationMinutes = getDurationMinutes(agendaItem);
  const taskType = agendaItem.task?.taskType ?? 'regular';
  const meetingData = (agendaItem as AgendaItemEnrichedDto & {
    meetingData?: { location?: string; attendees?: string[] };
  }).meetingData;

  return (
    <Screen
      scrollable
      hasTabBar
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {isOrphaned && (
          <View style={styles.orphanedBadge}>
            <OrphanedItemBadge />
          </View>
        )}
      </View>

      <Stack.Screen options={{ title }} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schedule</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.valueStrong}>{scheduledDate || 'Unscheduled'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.valueStrong}>{formatTime(scheduledTime)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.valueStrong}>{formatDuration(durationMinutes)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeBadge}>
            <AppIcon
              name={taskType === 'meeting' ? 'users' : taskType === 'milestone' ? 'milestone' : 'task'}
              size={14}
              color={theme.text.secondary}
            />
            <Text style={styles.typeBadgeText}>
              {taskType === 'meeting' && 'Meeting'}
              {taskType === 'milestone' && 'Milestone'}
              {taskType === 'regular' && 'Regular'}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Status</Text>
          <View style={[styles.statusBadge, isCompleted && styles.statusBadgeCompleted]}>
            <Text style={[styles.statusText, isCompleted && styles.statusTextCompleted]}>
              {isCompleted ? 'Completed' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>

      {meetingData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meeting Details</Text>
          {meetingData.location && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>{meetingData.location}</Text>
            </View>
          )}
          {meetingData.attendees && meetingData.attendees.length > 0 && (
            <View style={styles.infoColumn}>
              <Text style={styles.label}>Attendees:</Text>
              {meetingData.attendees.map((attendee, index) => (
                <Text key={index} style={styles.attendee}>• {attendee}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Source</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Project</Text>
          <Text style={styles.valueStrong}>{agendaItem.task?.projectName || 'Unknown Project'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Board</Text>
          <Text style={styles.valueStrong}>{agendaItem.task?.boardName || 'Unknown Board'}</Text>
        </View>
        {agendaItem.task?.columnName && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Column</Text>
            <Text style={styles.valueStrong}>{agendaItem.task?.columnName}</Text>
          </View>
        )}
      </View>

      {!isOrphaned && agendaItem.taskId && (
        <TouchableOpacity style={styles.primaryButton} onPress={handleNavigateToTask}>
          <Text style={styles.primaryButtonText}>View Task Details</Text>
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <View style={styles.notesHeader}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {!isEditingNotes ? (
            <TouchableOpacity onPress={() => setIsEditingNotes(true)}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.notesActions}>
              <TouchableOpacity onPress={() => {
                setNotes(agendaItem.notes || '');
                setIsEditingNotes(false);
              }}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveNotes}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {isEditingNotes ? (
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about this agenda item..."
            placeholderTextColor={theme.text.tertiary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        ) : (
          <Text style={styles.notesText}>
            {notes || 'No notes yet. Tap Edit to add notes.'}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.completeButton, isCompleted && styles.completeButtonDone]}
          onPress={handleToggleComplete}
        >
          <View style={styles.actionButtonContent}>
            <AppIcon name="check" size={16} color={isCompleted ? theme.accent.warning : theme.accent.success} />
            <Text style={[styles.completeButtonText, isCompleted && styles.completeButtonTextDone]}>
              {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rescheduleButton} onPress={handleReschedule}>
          <View style={styles.actionButtonContent}>
            <AppIcon name="calendar" size={16} color={theme.accent.primary} />
            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <View style={styles.actionButtonContent}>
            <AppIcon name="trash" size={16} color={theme.accent.error} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background.primary,
  },
  errorText: {
    fontSize: 16,
    color: theme.text.tertiary,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 12,
  },
  orphanedBadge: {
    marginTop: 8,
  },
  section: {
    backgroundColor: theme.card.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.card.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoColumn: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  value: {
    fontSize: 14,
    color: theme.text.primary,
  },
  valueStrong: {
    fontSize: 14,
    color: theme.text.primary,
    fontWeight: '600',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  typeBadgeText: {
    fontSize: 12,
    color: theme.text.secondary,
    fontWeight: '600',
  },
  attendee: {
    fontSize: 14,
    color: theme.text.primary,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: theme.accent.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.background.primary,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.accent.primary,
  },
  notesActions: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelButton: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.tertiary,
  },
  saveButton: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.accent.primary,
  },
  notesInput: {
    backgroundColor: theme.input.background,
    borderWidth: 1,
    borderColor: theme.input.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.text.primary,
    minHeight: 120,
  },
  notesText: {
    fontSize: 14,
    color: theme.text.primary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 32,
  },
  completeButton: {
    flex: 1,
    backgroundColor: theme.card.background,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.accent.success,
  },
  completeButtonDone: {
    borderColor: theme.accent.warning,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.accent.success,
  },
  completeButtonTextDone: {
    color: theme.accent.warning,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rescheduleButton: {
    flex: 1,
    backgroundColor: theme.card.background,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.accent.primary,
  },
  rescheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.accent.primary,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: theme.card.background,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.accent.error,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.accent.error,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: theme.background.elevated,
  },
  statusBadgeCompleted: {
    borderColor: theme.accent.success,
    backgroundColor: theme.accent.success + '22',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  statusTextCompleted: {
    color: theme.accent.success,
  },
});
