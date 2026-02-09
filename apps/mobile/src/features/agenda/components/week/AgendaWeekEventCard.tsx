import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import theme from '@shared/theme/colors';
import { getItemTitle, isItemCompleted } from '../../utils/agendaHelpers';
import { getAccentColor, formatTime } from '../../utils/agendaFormatters';
import { getCardTintColor } from '../../utils/cardStyles';
import { getScheduledTime } from '../../utils/agendaHelpers';

interface AgendaWeekEventCardProps {
  item: AgendaItemEnrichedDto;
  onPress: () => void;
  onLongPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const AgendaWeekEventCard: React.FC<AgendaWeekEventCardProps> = ({
  item,
  onPress,
  onLongPress,
  style,
}) => {
  const title = useMemo(() => getItemTitle(item), [item]);
  const accentColor = useMemo(() => getAccentColor(item), [item]);
  const tintColor = useMemo(() => getCardTintColor(item), [item]);
  const isCompleted = isItemCompleted(item);
  const timeLabel = useMemo(() => formatTime(getScheduledTime(item)), [item]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderLeftColor: accentColor, backgroundColor: tintColor || theme.card.background },
        isCompleted && styles.containerCompleted,
        style,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.content}>
        <Text
          numberOfLines={2}
          style={[styles.title, isCompleted && styles.titleCompleted]}
        >
          {title}
        </Text>
        {timeLabel && (
          <Text style={styles.time} numberOfLines={1}>{timeLabel}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 8,
    backgroundColor: theme.card.background,
    borderWidth: 1,
    borderColor: theme.card.border,
    borderLeftWidth: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
    overflow: 'hidden',
    minHeight: 44,
  },
  containerCompleted: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.text.primary,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.text.tertiary,
  },
  time: {
    fontSize: 9,
    color: theme.text.secondary,
    marginTop: 2,
  },
});
