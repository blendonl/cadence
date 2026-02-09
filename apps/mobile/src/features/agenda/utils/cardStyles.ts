import { AgendaItemEnrichedDto } from 'shared-types';

export const CARD_TINT_COLORS = {
  meeting: 'rgba(60, 203, 140, 0.08)',
  milestone: 'rgba(155, 122, 246, 0.08)',
  routine: 'rgba(122, 140, 255, 0.08)',
  task: 'transparent',
} as const;

export const getCardTintColor = (item: AgendaItemEnrichedDto): string => {
  if (item.routineTaskId) return CARD_TINT_COLORS.routine;
  if (item.task?.taskType === 'meeting') return CARD_TINT_COLORS.meeting;
  if (item.task?.taskType === 'milestone') return CARD_TINT_COLORS.milestone;
  return CARD_TINT_COLORS.task;
};

export const getDetailGlassTint = (item: AgendaItemEnrichedDto): 'blue' | 'purple' | 'neutral' => {
  if (item.routineTaskId) return 'purple';
  if (item.task?.taskType === 'meeting') return 'blue';
  if (item.task?.taskType === 'milestone') return 'purple';
  return 'blue';
};
