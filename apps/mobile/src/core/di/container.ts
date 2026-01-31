import "reflect-metadata";
import { container } from "tsyringe";

import {
  PROJECT_REPOSITORY,
  AGENDA_REPOSITORY,
  NOTE_REPOSITORY,
  GOAL_REPOSITORY,
  TIME_LOG_REPOSITORY,
  CALENDAR_REPOSITORY,
  ROUTINE_REPOSITORY,
  BOARD_SERVICE,
  COLUMN_SERVICE,
  PROJECT_SERVICE,
  AGENDA_SERVICE,
  NOTE_SERVICE,
  TASK_SERVICE,
  GOAL_SERVICE,
  TIME_TRACKING_SERVICE,
  CALENDAR_SYNC_SERVICE,
  NOTIFICATION_SERVICE,
  ROUTINE_SERVICE,
  STORAGE_CONFIG,
  ACTIONS_CONFIG,
  BACKEND_API_CLIENT,
  DAEMON_RUNNER,
  WEBSOCKET_MANAGER,
} from "./tokens";

import { StorageConfig } from "@core/StorageConfig";
import { ActionsConfig } from "@core/ActionsConfig";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";

import { BackendProjectRepository } from "@features/projects/infrastructure/BackendProjectRepository";
import { BackendAgendaRepository } from "@features/agenda/infrastructure/BackendAgendaRepository";
import { BackendNoteRepository } from "@features/notes/infrastructure/BackendNoteRepository";
import { BackendGoalRepository } from "@features/goals/infrastructure/BackendGoalRepository";
import { BackendTimeLogRepository } from "@features/time/infrastructure/BackendTimeLogRepository";
import { BackendRoutineRepository } from "@features/routines/infrastructure/BackendRoutineRepository";

import { GoogleCalendarRepository } from "@infrastructure/calendar/GoogleCalendarRepository";
import { BoardService } from "@features/boards";
import { ColumnService } from "@features/columns";
import { TaskService } from "@features/tasks";
import { ProjectService } from "@features/projects/services/ProjectService";
import { AgendaService } from "@features/agenda/services/AgendaService";
import { NoteService } from "@features/notes/services/NoteService";
import { GoalService } from "@features/goals/services/GoalService";
import { TimeTrackingService } from "@features/time/services/TimeTrackingService";
import { RoutineService } from "@features/routines/services/RoutineService";
import { CalendarSyncService } from "@services/CalendarSyncService";
import { NotificationService } from "@services/NotificationService";

import { DaemonRunner } from "@infrastructure/daemon/DaemonRunner";
import { WebSocketManager } from "@infrastructure/websocket/WebSocketManager";
import { WebSocketTask } from "@infrastructure/daemon/tasks";
import { WebSocketClient } from "@infrastructure/websocket/WebSocketClient";
import { API_BASE_URL } from "@core/config/ApiConfig";

let isInitialized = false;

export type InitializationProgressCallback = (step: string) => void;

let progressCallback: InitializationProgressCallback | null = null;

export function setInitializationProgressCallback(
  callback: InitializationProgressCallback | null
): void {
  progressCallback = callback;
}

export async function initializeContainer(
  useBackend: boolean = true
): Promise<void> {
  if (isInitialized) {
    console.log("[DI Container] Already initialized");
    return;
  }

  progressCallback?.("Starting initialization...");
  console.log("[DI Container] Starting initialization...");

  progressCallback?.("Registering core infrastructure...");
  container.registerSingleton(STORAGE_CONFIG, StorageConfig);
  container.registerSingleton(ACTIONS_CONFIG, ActionsConfig);
  container.registerSingleton(BACKEND_API_CLIENT, BackendApiClient);
  container.registerSingleton(WEBSOCKET_MANAGER, WebSocketManager);

  progressCallback?.("Loading storage configuration...");
  console.log("[DI Container] Loading storage config...");
  const storageConfig = container.resolve<StorageConfig>(STORAGE_CONFIG);
  const boardsDir = await storageConfig.getBoardsDirectory();
  const defaultDir = storageConfig.getDefaultBoardsDirectory();
  if (boardsDir !== defaultDir) {
    console.log("Custom boards directory loaded:", boardsDir);
  }
  console.log("[DI Container] Storage config loaded");

  progressCallback?.("Loading actions configuration...");
  console.log("[DI Container] Loading actions config...");
  const actionsConfig = container.resolve<ActionsConfig>(ACTIONS_CONFIG);
  await actionsConfig.initialize();
  console.log("[DI Container] Actions config loaded");

  progressCallback?.("Registering repositories...");
  container.registerSingleton(PROJECT_REPOSITORY, BackendProjectRepository);
  container.registerSingleton(AGENDA_REPOSITORY, BackendAgendaRepository);
  container.registerSingleton(NOTE_REPOSITORY, BackendNoteRepository);
  container.registerSingleton(GOAL_REPOSITORY, BackendGoalRepository);
  container.registerSingleton(TIME_LOG_REPOSITORY, BackendTimeLogRepository);
  container.registerSingleton(ROUTINE_REPOSITORY, BackendRoutineRepository);
  container.registerSingleton(CALENDAR_REPOSITORY, GoogleCalendarRepository);

  progressCallback?.("Registering services...");

  container.registerSingleton(BOARD_SERVICE, BoardService);
  container.registerSingleton(COLUMN_SERVICE, ColumnService);
  container.registerSingleton(TASK_SERVICE, TaskService);
  container.registerSingleton(PROJECT_SERVICE, ProjectService);
  container.registerSingleton(AGENDA_SERVICE, AgendaService);
  container.registerSingleton(NOTE_SERVICE, NoteService);
  container.registerSingleton(GOAL_SERVICE, GoalService);
  container.registerSingleton(TIME_TRACKING_SERVICE, TimeTrackingService);
  container.registerSingleton(ROUTINE_SERVICE, RoutineService);
  container.registerSingleton(CALENDAR_SYNC_SERVICE, CalendarSyncService);

  container.register(NOTIFICATION_SERVICE, {
    useFactory: (c) => {
      const service = new NotificationService(c.resolve(ACTIONS_CONFIG));
      service.initialize().catch((error) => {
        console.error("Failed to initialize NotificationService:", error);
      });
      return service;
    },
  });

  container.register(DAEMON_RUNNER, {
    useFactory: () => {
      const runner = new DaemonRunner();

      const wsClient = new WebSocketClient('/ws/changes', {
        autoReconnect: true,
      });

      const wsTask = new WebSocketTask(wsClient, {
        enabled: true,
        runInBackground: false,
        entityTypes: ['agenda'],
      });

      runner.registerTask(wsTask);
      return runner;
    },
  });

  progressCallback?.("Starting daemon runner...");
  console.log("[DI Container] Starting DaemonRunner...");
  const daemonRunner = container.resolve<DaemonRunner>(DAEMON_RUNNER);
  try {
    await daemonRunner.start();
    console.log("[DI Container] DaemonRunner started");
  } catch (error) {
    console.error("[DI Container] DaemonRunner failed to start:", error);
  }

  isInitialized = true;
  progressCallback?.("Initialization complete");
  console.log("[DI Container] Initialization complete");
}

export function isContainerInitialized(): boolean {
  return isInitialized;
}

export function resetContainer(): void {
  container.clearInstances();
  isInitialized = false;
}

export function getContainer() {
  return container;
}

export { container };
