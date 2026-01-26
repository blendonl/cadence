/**
 * Agenda item status enumeration
 */

export enum AgendaItemStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  UNFINISHED = 'UNFINISHED',
  SKIPPED = 'SKIPPED',
}

export type AgendaItemStatusType = `${AgendaItemStatus}`;
