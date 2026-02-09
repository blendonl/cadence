import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { AgendaViewMode } from 'shared-types';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import AppIcon from '@shared/components/icons/AppIcon';
import { HeaderNavButton } from './HeaderNavButton';
import { ViewModePill } from './ViewModePill';

interface AgendaUnifiedHeaderProps {
  label: string;
  viewMode: AgendaViewMode;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onDatePress: () => void;
  onTodayPress: () => void;
  onViewModeChange: (mode: AgendaViewMode) => void;
}

export const AgendaUnifiedHeader: React.FC<AgendaUnifiedHeaderProps> = ({
  label,
  viewMode,
  onPreviousDay,
  onNextDay,
  onDatePress,
  onTodayPress,
  onViewModeChange,
}) => {
  return (
    <View style={styles.wrapper}>
      <BlurView intensity={20} tint="dark" style={styles.blur}>
        <View style={styles.content}>
          <HeaderNavButton
            icon="arrow-left"
            onPress={onPreviousDay}
            accessibilityLabel="Previous"
          />

          <Pressable
            style={styles.dateButton}
            onPress={onDatePress}
            accessibilityLabel={`Selected date: ${label}`}
            accessibilityRole="button"
            accessibilityHint="Open calendar picker"
          >
            <AppIcon name="calendar" size={13} color={theme.text.secondary} />
            <Text style={styles.dateLabel} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>

          <HeaderNavButton
            icon="sun"
            onPress={onTodayPress}
            accessibilityLabel="Go to today"
            variant="today"
            size={28}
          />

          <View style={styles.divider} />

          <ViewModePill value={viewMode} onChange={onViewModeChange} />

          <HeaderNavButton
            icon="arrow-right"
            onPress={onNextDay}
            accessibilityLabel="Next"
          />
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 52,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  blur: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.glass.tint.neutral,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: theme.glass.border,
  },
});
