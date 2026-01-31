import { injectable, inject } from 'tsyringe';
import { CalendarEvent, SyncStatus } from '../domain/entities/CalendarEvent';
import { CalendarRepository } from '../domain/repositories/CalendarRepository';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CALENDAR_REPOSITORY, BOARD_SERVICE } from '@core/di/tokens';
import { BoardService } from '@features/boards/services/BoardService';
import { TaskDto } from 'shared-types';

const STORAGE_KEYS = {
  LAST_SYNC: 'calendar_last_sync',
  SYNC_ENABLED: 'calendar_sync_enabled',
  CALENDAR_EVENTS: 'calendar_events_cache',
};

export interface SyncResult {
  success: boolean;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  tasksUpdated: number;
  conflicts: ConflictInfo[];
  error?: string;
}

export interface ConflictInfo {
  eventId: string;
  taskId?: string;
  localVersion: CalendarEvent;
  remoteVersion: CalendarEvent;
  resolvedWith: 'local' | 'remote' | 'unresolved';
}

export type SyncDirection = 'both' | 'to_calendar' | 'from_calendar';

@injectable()
export class CalendarSyncService {
  private syncInProgress = false;
  private syncListeners: Set<(status: SyncStatus) => void> = new Set();

  constructor(
    @inject(CALENDAR_REPOSITORY) private calendarRepository: CalendarRepository,
    @inject(BOARD_SERVICE) private boardService: BoardService
  ) {}

  async isAuthenticated(): Promise<boolean> {
    return this.calendarRepository.isAuthenticated();
  }

  async connect(): Promise<boolean> {
    return this.calendarRepository.authenticate();
  }

  async disconnect(): Promise<void> {
    await this.calendarRepository.logout();
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    await AsyncStorage.removeItem(STORAGE_KEYS.CALENDAR_EVENTS);
  }

  async isSyncEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_ENABLED);
    return enabled === 'true';
  }

  async setSyncEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_ENABLED, enabled.toString());
  }

  async getLastSyncTime(): Promise<Date | null> {
    const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return timestamp ? new Date(timestamp) : null;
  }

  async sync(direction: SyncDirection = 'both'): Promise<SyncResult> {
    if (this.syncInProgress) {
      return {
        success: false,
        eventsCreated: 0,
        eventsUpdated: 0,
        eventsDeleted: 0,
        tasksUpdated: 0,
        conflicts: [],
        error: 'Sync already in progress',
      };
    }

    this.syncInProgress = true;
    this.notifyListeners('pending');

    try {
      const isAuth = await this.isAuthenticated();
      if (!isAuth) {
        throw new Error('Not authenticated with Google Calendar');
      }

      const result: SyncResult = {
        success: true,
        eventsCreated: 0,
        eventsUpdated: 0,
        eventsDeleted: 0,
        tasksUpdated: 0,
        conflicts: [],
      };

      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      this.notifyListeners('synced');

      return result;
    } catch (error) {
      this.notifyListeners('conflict');
      return {
        success: false,
        eventsCreated: 0,
        eventsUpdated: 0,
        eventsDeleted: 0,
        tasksUpdated: 0,
        conflicts: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      this.syncInProgress = false;
    }
  }


  private async cacheEvents(events: CalendarEvent[]): Promise<void> {
    const serialized = events.map(e => e.toDict());
    await AsyncStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(serialized));
  }

  async getCachedEvents(): Promise<CalendarEvent[]> {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS);
    if (!cached) return [];

    try {
      const parsed = JSON.parse(cached);
      return parsed.map((e: any) => CalendarEvent.fromDict(e));
    } catch {
      return [];
    }
  }

  async getEventsForDate(date: string): Promise<CalendarEvent[]> {
    const cached = await this.getCachedEvents();
    return cached.filter(e => e.dateString === date);
  }

  async getEventsForDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const isAuth = await this.isAuthenticated();
    if (isAuth) {
      return this.calendarRepository.getEvents(startDate, endDate);
    }
    return this.getCachedEvents().then(events =>
      events.filter(e => e.start_time >= startDate && e.start_time <= endDate)
    );
  }

  onSyncStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  private notifyListeners(status: SyncStatus): void {
    this.syncListeners.forEach(listener => listener(status));
  }

  async deleteTaskEvent(task: TaskDto): Promise<boolean> {
    return true;
  }
}
