import { RoutineType } from 'shared-types';
import theme, { CatppuccinColors } from '@shared/theme/colors';
import { AppIconName } from '@shared/components/icons/AppIcon';

interface TypeBadgeConfig {
  color: string;
  label: string;
  icon: AppIconName;
}

export const ROUTINE_TYPE_BADGE_CONFIG: Record<RoutineType, TypeBadgeConfig> = {
  SLEEP: { color: CatppuccinColors.mauve, label: 'Sleep', icon: 'moon' },
  STEP: { color: CatppuccinColors.teal, label: 'Steps', icon: 'steps' },
  OTHER: { color: CatppuccinColors.peach, label: 'Other', icon: 'list' },
};

export interface RoutineTypeGradient {
  bgColor: string;
  accent: string;
  glow: string;
  subtleBg: string;
  iconBg: string;
}

export const ROUTINE_TYPE_GRADIENTS: Record<RoutineType, RoutineTypeGradient> = {
  SLEEP: {
    bgColor: '#1E1250',
    accent: CatppuccinColors.mauve,
    glow: 'rgba(155, 122, 246, 0.35)',
    subtleBg: 'rgba(155, 122, 246, 0.06)',
    iconBg: 'rgba(155, 122, 246, 0.15)',
  },
  STEP: {
    bgColor: '#0C3028',
    accent: CatppuccinColors.teal,
    glow: 'rgba(90, 209, 178, 0.35)',
    subtleBg: 'rgba(90, 209, 178, 0.06)',
    iconBg: 'rgba(90, 209, 178, 0.15)',
  },
  OTHER: {
    bgColor: '#30240C',
    accent: CatppuccinColors.peach,
    glow: 'rgba(242, 154, 100, 0.35)',
    subtleBg: 'rgba(242, 154, 100, 0.06)',
    iconBg: 'rgba(242, 154, 100, 0.15)',
  },
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
