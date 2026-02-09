import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import AppIcon from '@shared/components/icons/AppIcon';
import GlassCard from '@shared/components/GlassCard';
import { getScheduledDate, getScheduledTime, getDurationMinutes } from '@features/agenda/utils/agendaHelpers';
import { formatTime, formatDuration, formatScheduleDate } from '@features/agenda/utils/agendaFormatters';

interface DetailScheduleBarProps {
  item: AgendaItemEnrichedDto;
}

export const DetailScheduleBar: React.FC<DetailScheduleBarProps> = ({ item }) => {
  const scheduledDate = getScheduledDate(item);
  const scheduledTime = getScheduledTime(item);
  const durationMinutes = getDurationMinutes(item);

  const dateDisplay = formatScheduleDate(scheduledDate);
  const timeDisplay = formatTime(scheduledTime);
  const durationDisplay = formatDuration(durationMinutes);

  const segments: { icon: 'calendar' | 'clock'; text: string }[] = [];
  if (dateDisplay) segments.push({ icon: 'calendar', text: dateDisplay });
  if (timeDisplay) segments.push({ icon: 'clock', text: timeDisplay });
  if (durationDisplay) segments.push({ icon: 'clock', text: durationDisplay });

  if (segments.length === 0) return null;

  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        {segments.map((segment, index) => (
          <React.Fragment key={`${segment.icon}-${index}`}>
            {index > 0 && <Text style={styles.dot}>·</Text>}
            <View style={styles.segment}>
              <AppIcon name={segment.icon} size={14} color={theme.text.secondary} />
              <Text style={styles.text}>{segment.text}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    fontSize: 16,
    color: theme.text.muted,
    fontWeight: '700',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
});
