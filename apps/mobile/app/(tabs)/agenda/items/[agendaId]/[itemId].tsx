import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { theme } from '@shared/theme/colors';
import { Screen } from '@shared/components/Screen';
import { useAgendaItemDetail } from '@features/agenda/hooks/useAgendaItemDetail';
import { getItemTitle, isItemCompleted, getScheduledDate, getScheduledTime, getDurationMinutes } from '@features/agenda/utils/agendaHelpers';
import { DetailLoadingSkeleton } from '@features/agenda/components/detail/DetailLoadingSkeleton';
import { DetailHeroSection } from '@features/agenda/components/detail/DetailHeroSection';
import { DetailScheduleBar } from '@features/agenda/components/detail/DetailScheduleBar';
import { DetailSourceChips } from '@features/agenda/components/detail/DetailSourceChips';
import { DetailNotesSection } from '@features/agenda/components/detail/DetailNotesSection';
import { DetailActionBar } from '@features/agenda/components/detail/DetailActionBar';
import { DetailActivityLog } from '@features/agenda/components/detail/DetailActivityLog';
import { RescheduleModal } from '@features/agenda/components/RescheduleModal';

export default function AgendaItemDetailScreen() {
  const { agendaId: agendaIdParam, itemId: itemIdParam } = useLocalSearchParams<{
    agendaId?: string | string[];
    itemId?: string | string[];
  }>();
  const agendaId = Array.isArray(agendaIdParam) ? agendaIdParam[0] : agendaIdParam;
  const itemId = Array.isArray(itemIdParam) ? itemIdParam[0] : itemIdParam;

  const {
    loading,
    agendaItem,
    notes,
    setNotes,
    isEditingNotes,
    setIsEditingNotes,
    showReschedule,
    setShowReschedule,
    actionLoading,
    handleDelete,
    handleReschedule,
    handleSaveNotes,
    handleToggleComplete,
    handleNavigateToTask,
  } = useAgendaItemDetail(agendaId, itemId);

  if (loading) {
    return (
      <Screen scrollable hasTabBar style={styles.container} contentContainerStyle={styles.content}>
        <DetailLoadingSkeleton />
      </Screen>
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

  const title = getItemTitle(agendaItem);

  return (
    <Screen scrollable hasTabBar style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title }} />

      <DetailHeroSection item={agendaItem} />
      <DetailScheduleBar item={agendaItem} />
      <DetailSourceChips item={agendaItem} onNavigateToTask={handleNavigateToTask} />

      <DetailNotesSection
        notes={notes}
        onNotesChange={setNotes}
        onSave={handleSaveNotes}
        isEditing={isEditingNotes}
        setIsEditing={setIsEditingNotes}
        originalNotes={agendaItem.notes || ''}
      />

      <DetailActionBar
        isCompleted={isItemCompleted(agendaItem)}
        actionLoading={actionLoading}
        onToggleComplete={handleToggleComplete}
        onReschedule={() => setShowReschedule(true)}
        onDelete={handleDelete}
      />

      {agendaItem.logs && agendaItem.logs.length > 0 && (
        <DetailActivityLog logs={agendaItem.logs} />
      )}

      <RescheduleModal
        visible={showReschedule}
        onClose={() => setShowReschedule(false)}
        onSubmit={handleReschedule}
        initialDate={getScheduledDate(agendaItem)}
        initialTime={getScheduledTime(agendaItem)}
        initialDuration={getDurationMinutes(agendaItem)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
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
});
