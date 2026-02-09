import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import AppIcon from '@shared/components/icons/AppIcon';
import theme, { CatppuccinColors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { ROUTINE_TYPE_GRADIENTS } from '../constants/routineConstants';

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

const calcDuration = (bedH: number, bedM: number, wakeH: number, wakeM: number): string => {
  let totalMin = (wakeH * 60 + wakeM) - (bedH * 60 + bedM);
  if (totalMin <= 0) totalMin += 24 * 60;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const wrapHour = (h: number): number => ((h % 24) + 24) % 24;

export function SleepWindowPicker({ value, onChange, error }: SleepWindowPickerProps) {
  const { bedHour, bedMin, wakeHour, wakeMin } = parseSleepWindow(value);
  const gradient = ROUTINE_TYPE_GRADIENTS.SLEEP;

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
          iconColor={CatppuccinColors.mauve}
          title="Bedtime"
          hour={bedHour}
          min={bedMin}
          onStepHour={stepBedHour}
          onStepMin={stepBedMin}
          accentColor={CatppuccinColors.mauve}
        />

        <View style={styles.dividerColumn}>
          <View style={[styles.dividerLine, { backgroundColor: gradient.accent + '30' }]} />
          <AppIcon name="arrow-right" size={16} color={theme.text.muted} />
          <View style={[styles.dividerLine, { backgroundColor: gradient.accent + '30' }]} />
        </View>

        <TimeColumn
          icon="sun"
          iconColor={CatppuccinColors.yellow}
          title="Wake up"
          hour={wakeHour}
          min={wakeMin}
          onStepHour={stepWakeHour}
          onStepMin={stepWakeMin}
          accentColor={CatppuccinColors.yellow}
        />
      </View>

      <View style={[styles.durationBar, { backgroundColor: gradient.bgColor }]}>
        <AppIcon name="clock" size={14} color={gradient.accent} />
        <Text style={[styles.durationText, { color: gradient.accent }]}>{duration} sleep</Text>
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
  accentColor: string;
}

function TimeColumn({ icon, iconColor, title, hour, min, onStepHour, onStepMin, accentColor }: TimeColumnProps) {
  return (
    <View style={styles.timeColumn}>
      <View style={styles.timeHeader}>
        <AppIcon name={icon} size={14} color={iconColor} />
        <Text style={[styles.timeTitle, { color: iconColor }]}>{title}</Text>
      </View>

      <View style={styles.stepperPair}>
        <View style={styles.stepperUnit}>
          <TouchableOpacity
            style={[styles.miniStep, { borderColor: accentColor + '20' }]}
            onPress={() => onStepHour(1)}
            activeOpacity={0.7}
          >
            <Text style={[styles.miniStepText, { color: accentColor }]}>+</Text>
          </TouchableOpacity>
          <Text style={styles.digitText}>{hour.toString().padStart(2, '0')}</Text>
          <TouchableOpacity
            style={[styles.miniStep, { borderColor: accentColor + '20' }]}
            onPress={() => onStepHour(-1)}
            activeOpacity={0.7}
          >
            <Text style={[styles.miniStepText, { color: accentColor }]}>-</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.colon}>:</Text>

        <View style={styles.stepperUnit}>
          <TouchableOpacity
            style={[styles.miniStep, { borderColor: accentColor + '20' }]}
            onPress={() => onStepMin(15)}
            activeOpacity={0.7}
          >
            <Text style={[styles.miniStepText, { color: accentColor }]}>+</Text>
          </TouchableOpacity>
          <Text style={styles.digitText}>{min.toString().padStart(2, '0')}</Text>
          <TouchableOpacity
            style={[styles.miniStep, { borderColor: accentColor + '20' }]}
            onPress={() => onStepMin(-15)}
            activeOpacity={0.7}
          >
            <Text style={[styles.miniStepText, { color: accentColor }]}>-</Text>
          </TouchableOpacity>
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
  },
  dividerColumn: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  dividerLine: {
    width: 1,
    height: 16,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.background.elevated,
    borderRadius: 16,
    padding: spacing.md,
    paddingVertical: spacing.lg,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  timeTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepperPair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepperUnit: {
    alignItems: 'center',
    gap: 4,
  },
  miniStep: {
    width: 38,
    height: 28,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniStepText: {
    fontSize: 16,
    fontWeight: '500',
  },
  digitText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text.primary,
    fontVariant: ['tabular-nums'],
  },
  colon: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text.muted,
    paddingBottom: 2,
  },
  durationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: 10,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    color: theme.status.error,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
