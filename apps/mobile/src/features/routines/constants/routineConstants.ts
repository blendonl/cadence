import { RoutineType } from 'shared-types';
import theme from '@shared/theme/colors';
import { AppIconName } from '@shared/components/icons/AppIcon';

interface TypeBadgeConfig {
  color: string;
  label: string;
  icon: AppIconName;
}

export const ROUTINE_TYPE_BADGE_CONFIG: Record<RoutineType, TypeBadgeConfig> = {
  SLEEP: { color: theme.accent.info, label: 'Sleep', icon: 'moon' },
  STEP: { color: theme.accent.success, label: 'Steps', icon: 'steps' },
  OTHER: { color: theme.text.muted, label: 'Other', icon: 'list' },
};

export interface RepeatIntervalPreset {
  label: string;
  minutes: number;
}

export const REPEAT_INTERVAL_PRESETS: RepeatIntervalPreset[] = [
  { label: 'Every 8h', minutes: 480 },
  { label: 'Every 12h', minutes: 720 },
  { label: 'Daily', minutes: 1440 },
  { label: 'Every 2 days', minutes: 2880 },
  { label: 'Weekly', minutes: 10080 },
];

export const STEP_TARGET_PRESETS = [5000, 8000, 10000, 12000, 15000] as const;

export const DEFAULT_SLEEP_WINDOW = '23:00-07:00';

export const SEPARATE_INTO_RANGE = {
  min: 1,
  max: 10,
  step: 1,
  default: 1,
} as const;

export const FIXED_DAILY_TYPES: RoutineType[] = ['SLEEP', 'STEP'];
