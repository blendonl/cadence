import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface SleepWindowPickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const parseSleepWindow = (value: string): { bedHour: number; bedMin: number; wakeHour: number; wakeMin: number } => {
  const match = value.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
  if (match) {
    return {
      bedHour: parseInt(match[1], 10),
      bedMin: parseInt(match[2], 10),
      wakeHour: parseInt(match[3], 10),
      wakeMin: parseInt(match[4], 10),
    };
  }
  return { bedHour: 23, bedMin: 0, wakeHour: 7, wakeMin: 0 };
};

const formatTime = (hour: number, min: number): string => {
  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
};

const formatTimeDisplay = (hour: number, min: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
};

const calcDuration = (bedH: number, bedM: number, wakeH: number, wakeM: number): string => {
  let totalMin = (wakeH * 60 + wakeM) - (bedH * 60 + bedM);
  if (totalMin <= 0) totalMin += 24 * 60;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const wrapHour = (h: number): number => ((h % 24) + 24) % 24;
const wrapMin = (m: number): number => ((m % 60) + 60) % 60;

export function SleepWindowPicker({ value, onChange, error }: SleepWindowPickerProps) {
  const { bedHour, bedMin, wakeHour, wakeMin } = parseSleepWindow(value);

  const buildValue = (bh: number, bm: number, wh: number, wm: number) =>
    `${formatTime(bh, bm)}-${formatTime(wh, wm)}`;

  const stepBedHour = async (delta: number) => {
    onChange(buildValue(wrapHour(bedHour + delta), bedMin, wakeHour, wakeMin));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const stepBedMin = async (delta: number) => {
    let newMin = bedMin + delta;
    let newHour = bedHour;
    if (newMin >= 60) { newMin = 0; newHour = wrapHour(newHour + 1); }
    if (newMin < 0) { newMin = 45; newHour = wrapHour(newHour - 1); }
    onChange(buildValue(newHour, newMin, wakeHour, wakeMin));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const stepWakeHour = async (delta: number) => {
    onChange(buildValue(bedHour, bedMin, wrapHour(wakeHour + delta), wakeMin));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const stepWakeMin = async (delta: number) => {
    let newMin = wakeMin + delta;
    let newHour = wakeHour;
    if (newMin >= 60) { newMin = 0; newHour = wrapHour(newHour + 1); }
    if (newMin < 0) { newMin = 45; newHour = wrapHour(newHour - 1); }
    onChange(buildValue(bedHour, bedMin, newHour, newMin));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const duration = calcDuration(bedHour, bedMin, wakeHour, wakeMin);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sleep Window *</Text>

      <View style={styles.windowRow}>
        <TimeColumn
          icon="moon"
          iconColor={theme.accent.info}
          title="Bedtime"
          hour={bedHour}
          min={bedMin}
          onStepHour={stepBedHour}
          onStepMin={stepBedMin}
        />

        <View style={styles.divider}>
          <AppIcon name="arrow-right" size={20} color={theme.text.muted} />
        </View>

        <TimeColumn
          icon="sun"
          iconColor={theme.accent.warning}
          title="Wake up"
          hour={wakeHour}
          min={wakeMin}
          onStepHour={stepWakeHour}
          onStepMin={stepWakeMin}
        />
      </View>

      <View style={styles.durationRow}>
        <AppIcon name="clock" size={14} color={theme.text.tertiary} />
        <Text style={styles.durationText}>{duration} sleep</Text>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

interface TimeColumnProps {
  icon: 'moon' | 'sun';
  iconColor: string;
  title: string;
  hour: number;
  min: number;
  onStepHour: (delta: number) => void;
  onStepMin: (delta: number) => void;
}

function TimeColumn({ icon, iconColor, title, hour, min, onStepHour, onStepMin }: TimeColumnProps) {
  return (
    <View style={styles.timeColumn}>
      <View style={styles.timeHeader}>
        <AppIcon name={icon} size={16} color={iconColor} />
        <Text style={styles.timeTitle}>{title}</Text>
      </View>

      <Text style={styles.timeDisplay}>{formatTimeDisplay(hour, min)}</Text>

      <View style={styles.stepperPair}>
        <View style={styles.stepperUnit}>
          <TouchableOpacity style={styles.miniStep} onPress={() => onStepHour(1)} activeOpacity={0.7}>
            <Text style={styles.miniStepText}>+</Text>
          </TouchableOpacity>
          <Text style={styles.digitText}>{hour.toString().padStart(2, '0')}</Text>
          <TouchableOpacity style={styles.miniStep} onPress={() => onStepHour(-1)} activeOpacity={0.7}>
            <Text style={styles.miniStepText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.unitLabel}>hr</Text>
        </View>

        <Text style={styles.colon}>:</Text>

        <View style={styles.stepperUnit}>
          <TouchableOpacity style={styles.miniStep} onPress={() => onStepMin(15)} activeOpacity={0.7}>
            <Text style={styles.miniStepText}>+</Text>
          </TouchableOpacity>
          <Text style={styles.digitText}>{min.toString().padStart(2, '0')}</Text>
          <TouchableOpacity style={styles.miniStep} onPress={() => onStepMin(-15)} activeOpacity={0.7}>
            <Text style={styles.miniStepText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.unitLabel}>min</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: spacing.md,
  },
  windowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  divider: {
    paddingTop: spacing.xl,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.background.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    padding: spacing.md,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  timeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  timeDisplay: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: spacing.sm,
  },
  stepperPair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepperUnit: {
    alignItems: 'center',
  },
  miniStep: {
    width: 36,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.background.primary,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniStepText: {
    fontSize: 18,
    fontWeight: '400',
    color: theme.text.primary,
  },
  digitText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.primary,
    marginVertical: spacing.xs,
  },
  colon: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.muted,
    paddingBottom: spacing.lg,
  },
  unitLabel: {
    fontSize: 10,
    color: theme.text.tertiary,
    marginTop: 2,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: theme.background.elevated,
    borderRadius: 10,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  errorText: {
    fontSize: 12,
    color: theme.status.error,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
