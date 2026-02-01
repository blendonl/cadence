import { AgendaEnrichedDto, AgendaItemEnrichedDto } from 'shared-types';

export function getOrphanedItems(agenda: AgendaEnrichedDto): AgendaItemEnrichedDto[] {
  const allItems = [...agenda.tasks, ...agenda.steps, ...agenda.routines];
  return allItems.filter(item => !item.taskId && !item.routineTaskId);
}

export function isItemCompleted(item: AgendaItemEnrichedDto): boolean {
  return item.status === 'COMPLETED';
}

export function getCompletedAt(item: AgendaItemEnrichedDto): string | null {
  const completedLog = item.logs?.find(log => log.type === 'COMPLETED');
  return completedLog?.newValue?.completedAt || null;
}

export function isItemUnfinished(item: AgendaItemEnrichedDto): boolean {
  return item.status === 'UNFINISHED';
}

export function getScheduledDate(item: AgendaItemEnrichedDto): string | null {
  if (!item.startAt) return null;
  return item.startAt.split('T')[0];
}

export function getScheduledTime(item: AgendaItemEnrichedDto): string | null {
  if (!item.startAt) return null;
  const timePart = item.startAt.split('T')[1];
  if (!timePart) return null;
  return timePart.substring(0, 5);
}

export function getDurationMinutes(item: AgendaItemEnrichedDto): number | null {
  return item.duration;
}

export function formatTime(isoString: string | null): string {
  if (!isoString) return '';
  const time = getScheduledTime({ startAt: isoString } as AgendaItemEnrichedDto);
  return time || '';
}

export function combineDateTime(date: string, time: string | null): string | null {
  if (!time) return null;
  return `${date}T${time}:00`;
}

export function getItemTitle(item: AgendaItemEnrichedDto): string {
  if (item.task) return item.task.title;
  if (item.routineTask) return item.routineTask.name;
  return 'Untitled Item';
}

export function getItemProjectName(item: AgendaItemEnrichedDto): string | null {
  return item.task?.projectName || null;
}

export function getItemBoardName(item: AgendaItemEnrichedDto): string | null {
  return item.task?.boardName || null;
}

export function isOrphanedItem(item: AgendaItemEnrichedDto): boolean {
  return !item.taskId && !item.routineTaskId;
}
