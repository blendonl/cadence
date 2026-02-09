import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import { AppIconName } from '@shared/components/icons/AppIcon';

type TaskType = 'regular' | 'meeting' | 'milestone' | null;

export const formatTime = (time: string | null | undefined): string | null => {
  if (!time || typeof time !== 'string') return null;
  const [hours, minutes] = time.split(':');
  if (!hours || !minutes) return null;
  const hour = parseInt(hours, 10);
  if (Number.isNaN(hour)) return null;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
};

export const formatDuration = (minutes: number | null | undefined): string | null => {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const formatDurationLong = (minutes: number | null | undefined): string => {
  if (!minutes) return 'No duration';
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
};

export const formatHourLabel = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

export const getAccentColor = (item: AgendaItemEnrichedDto): string => {
  if (item.routineTaskId) return theme.accent.secondary;
  if (item.task?.taskType === 'meeting') return theme.accent.success;
  if (item.task?.taskType === 'milestone') return theme.accent.secondary;
  return theme.accent.primary;
};

export const getTaskTypeMeta = (taskType: TaskType, isRoutine: boolean) => {
  if (isRoutine) {
    return { label: 'Routine', color: theme.accent.secondary };
  }

  switch (taskType) {
    case 'meeting':
      return { label: 'Meeting', color: theme.accent.success };
    case 'milestone':
      return { label: 'Milestone', color: theme.accent.secondary };
    default:
      return { label: 'Task', color: theme.accent.primary };
  }
};

export const getTaskTypeIcon = (taskType: TaskType, isRoutine: boolean): AppIconName => {
  if (isRoutine) {
    return 'shuffle';
  }

  switch (taskType) {
    case 'meeting':
      return 'users';
    case 'milestone':
      return 'milestone';
    default:
      return 'task';
  }
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatScheduleDate = (dateString: string | null): string | null => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
};

export const formatRelativeDate = (isoTimestamp: string): string => {
  const now = Date.now();
  const then = new Date(isoTimestamp).getTime();
  const diffMs = now - then;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  const date = new Date(isoTimestamp);
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
};

type LogType = 'COMPLETED' | 'UNCOMPLETED' | 'MARKED_UNFINISHED' | 'RESCHEDULED' | 'CREATED' | 'UPDATED' | 'DELETED';

export const getLogEntryMeta = (logType: LogType): { label: string; color: string } => {
  switch (logType) {
    case 'COMPLETED':
      return { label: 'Completed', color: theme.accent.success };
    case 'UNCOMPLETED':
      return { label: 'Reopened', color: theme.accent.warning };
    case 'MARKED_UNFINISHED':
      return { label: 'Marked Unfinished', color: theme.accent.warning };
    case 'RESCHEDULED':
      return { label: 'Rescheduled', color: theme.accent.info };
    case 'CREATED':
      return { label: 'Created', color: theme.accent.primary };
    case 'UPDATED':
      return { label: 'Updated', color: theme.accent.secondary };
    case 'DELETED':
      return { label: 'Deleted', color: theme.accent.error };
    default:
      return { label: logType, color: theme.text.secondary };
  }
};
