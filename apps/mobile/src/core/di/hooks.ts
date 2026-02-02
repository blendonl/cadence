import { useMemo } from "react";
import { container } from "tsyringe";

import {
  CALENDAR_REPOSITORY,
  CALENDAR_SYNC_SERVICE,
  NOTIFICATION_SERVICE,
  STORAGE_CONFIG,
  ACTIONS_CONFIG,
  DAEMON_RUNNER,
  WEBSOCKET_MANAGER,
  BOARD_SERVICE,
  COLUMN_SERVICE,
  TASK_SERVICE,
  AGENDA_SERVICE,
  NOTE_SERVICE,
} from "./tokens";

import type { CalendarRepository } from "@domain/repositories/CalendarRepository";
import type { CalendarSyncService } from "@services/CalendarSyncService";
import type { NotificationService } from "@services/NotificationService";
import type { StorageConfig } from "@core/StorageConfig";
import type { ActionsConfig } from "@core/ActionsConfig";
import type { DaemonRunner } from "../../infrastructure/daemon/DaemonRunner";
import type { WebSocketManager } from "../../infrastructure/websocket/WebSocketManager";
import type { BoardService } from "@features/boards/services/BoardService";
import type { ColumnService } from "@features/columns/services/ColumnService";
import type { TaskService } from "@features/tasks/services/TaskService";
import type { AgendaService } from "@features/agenda/services/AgendaService";
import type { NoteService } from "@features/notes/services/NoteService";

export function useCalendarRepository(): CalendarRepository {
  return useMemo(
    () => container.resolve<CalendarRepository>(CALENDAR_REPOSITORY),
    []
  );
}

export function useCalendarSyncService(): CalendarSyncService {
  return useMemo(
    () => container.resolve<CalendarSyncService>(CALENDAR_SYNC_SERVICE),
    []
  );
}

export function useNotificationService(): NotificationService {
  return useMemo(
    () => container.resolve<NotificationService>(NOTIFICATION_SERVICE),
    []
  );
}

export function useStorageConfig(): StorageConfig {
  return useMemo(() => container.resolve<StorageConfig>(STORAGE_CONFIG), []);
}

export function useActionsConfig(): ActionsConfig {
  return useMemo(() => container.resolve<ActionsConfig>(ACTIONS_CONFIG), []);
}

export function useDaemonRunner(): DaemonRunner {
  return useMemo(() => container.resolve<DaemonRunner>(DAEMON_RUNNER), []);
}

export function useWebSocketManager(): WebSocketManager {
  return useMemo(
    () => container.resolve<WebSocketManager>(WEBSOCKET_MANAGER),
    []
  );
}

export function useBoardService(): BoardService {
  return useMemo(() => container.resolve<BoardService>(BOARD_SERVICE), []);
}

export function useColumnService(): ColumnService {
  return useMemo(() => container.resolve<ColumnService>(COLUMN_SERVICE), []);
}

export function useTaskService(): TaskService {
  return useMemo(() => container.resolve<TaskService>(TASK_SERVICE), []);
}

export function useAgendaService(): AgendaService {
  return useMemo(() => container.resolve<AgendaService>(AGENDA_SERVICE), []);
}

export function useNoteService(): NoteService {
  return useMemo(() => container.resolve<NoteService>(NOTE_SERVICE), []);
}

export function getCalendarSyncService(): CalendarSyncService {
  return container.resolve<CalendarSyncService>(CALENDAR_SYNC_SERVICE);
}

export function getNotificationService(): NotificationService {
  return container.resolve<NotificationService>(NOTIFICATION_SERVICE);
}

export function getStorageConfig(): StorageConfig {
  return container.resolve<StorageConfig>(STORAGE_CONFIG);
}

export function getActionsConfig(): ActionsConfig {
  return container.resolve<ActionsConfig>(ACTIONS_CONFIG);
}

export function getDaemonRunner(): DaemonRunner {
  return container.resolve<DaemonRunner>(DAEMON_RUNNER);
}

export function getWebSocketManager(): WebSocketManager {
  return container.resolve<WebSocketManager>(WEBSOCKET_MANAGER);
}

export function getBoardService(): BoardService {
  return container.resolve<BoardService>(BOARD_SERVICE);
}

export function getColumnService(): ColumnService {
  return container.resolve<ColumnService>(COLUMN_SERVICE);
}

export function getTaskService(): TaskService {
  return container.resolve<TaskService>(TASK_SERVICE);
}

export function getAgendaService(): AgendaService {
  return container.resolve<AgendaService>(AGENDA_SERVICE);
}

export function getNoteService(): NoteService {
  return container.resolve<NoteService>(NOTE_SERVICE);
}

export function getCalendarRepository(): CalendarRepository {
  return container.resolve<CalendarRepository>(CALENDAR_REPOSITORY);
}
