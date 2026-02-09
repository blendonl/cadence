import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AgendaItemLogDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import AppIcon from '@shared/components/icons/AppIcon';
import GlassCard from '@shared/components/GlassCard';
import { useCollapsibleSection } from '@features/agenda/hooks/useCollapsibleSection';
import { formatRelativeDate, getLogEntryMeta } from '@features/agenda/utils/agendaFormatters';

interface DetailActivityLogProps {
  logs: AgendaItemLogDto[];
}

export const DetailActivityLog: React.FC<DetailActivityLogProps> = ({ logs }) => {
  const { isCollapsed, toggle } = useCollapsibleSection('detail-activity-log', true);

  if (logs.length === 0) return null;

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <GlassCard>
      <TouchableOpacity onPress={toggle} activeOpacity={0.7} style={styles.header}>
        <Text style={styles.headerText}>Activity</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{logs.length}</Text>
        </View>
        <View style={styles.spacer} />
        <AppIcon
          name={isCollapsed ? 'arrow-down' : 'arrow-up'}
          size={16}
          color={theme.text.muted}
        />
      </TouchableOpacity>

      {!isCollapsed && (
        <View style={styles.timeline}>
          {sortedLogs.map((log, index) => {
            const meta = getLogEntryMeta(log.type);
            const isLast = index === sortedLogs.length - 1;

            return (
              <View key={log.id} style={styles.entry}>
                <View style={styles.dotColumn}>
                  <View style={[styles.dot, { backgroundColor: meta.color }]} />
                  {!isLast && <View style={styles.line} />}
                </View>
                <View style={styles.entryContent}>
                  <Text style={[styles.entryLabel, { color: meta.color }]}>
                    {meta.label}
                  </Text>
                  <Text style={styles.entryTime}>
                    {formatRelativeDate(log.createdAt)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: theme.background.elevatedHigh,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  spacer: {
    flex: 1,
  },
  timeline: {
    marginTop: 14,
    gap: 0,
  },
  entry: {
    flexDirection: 'row',
    minHeight: 36,
  },
  dotColumn: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: theme.border.primary,
    marginVertical: 4,
  },
  entryContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    marginLeft: 8,
  },
  entryLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  entryTime: {
    fontSize: 12,
    color: theme.text.muted,
  },
});
