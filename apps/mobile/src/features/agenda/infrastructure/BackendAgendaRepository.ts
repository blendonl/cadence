import { injectable } from "tsyringe";
import { AgendaRepository } from "../domain/repositories/AgendaRepository";
import { AgendaItem } from "../domain/entities/AgendaItem";
import { logger } from "@utils/logger";
import { API_BASE_URL } from "@core/config/ApiConfig";

@injectable()
export class BackendAgendaRepository implements AgendaRepository {
  private baseUrl: string;
  private agendaBaseUrl: string;
  private itemsBaseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.agendaBaseUrl = `${this.baseUrl}/agendas`;
    this.itemsBaseUrl = `${this.baseUrl}/agenda-items`;
  }

  private async parseJson<T>(response: Response): Promise<T | null> {
    const text = await response.text();
    if (!text.trim()) {
      return null;
    }
    return JSON.parse(text) as T;
  }

  async loadAgendaItemsForDate(date: string): Promise<AgendaItem[]> {
    try {
      const response = await fetch(
        `${this.agendaBaseUrl}/by-date/enriched?date=${date}`,
      );
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`Failed to load agenda items for date: ${date}`);
      }
      const data = await this.parseJson<{ items?: any[] }>(response);
      if (!data || !data.items) {
        return [];
      }
      return data.items.map((item: any) =>
        this.mapEnrichedItemToAgendaItem(item),
      );
    } catch (error) {
      logger.error("Failed to load agenda items for date:", error);
      throw error;
    }
  }

  async loadAgendaItemsForDateRange(
    startDate: string,
    endDate: string,
  ): Promise<AgendaItem[]> {
    try {
      const response = await fetch(
        `${this.agendaBaseUrl}/date-range?start=${startDate}&end=${endDate}`,
      );
      if (!response.ok) {
        throw new Error(
          `Failed to load agenda items for date range: ${startDate} - ${endDate}`,
        );
      }
      const agendas = (await this.parseJson<any[]>(response)) || [];
      const allItems: AgendaItem[] = [];
      for (const agenda of agendas) {
        if (agenda.items) {
          allItems.push(
            ...agenda.items.map((item: any) =>
              this.mapEnrichedItemToAgendaItem(item),
            ),
          );
        }
      }
      return allItems;
    } catch (error) {
      logger.error("Failed to load agenda items for date range:", error);
      throw error;
    }
  }

  async loadAgendasForDateRange(
    startDate: string,
    endDate: string,
  ): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.agendaBaseUrl}/date-range?start=${startDate}&end=${endDate}`,
      );
      if (!response.ok) {
        throw new Error(
          `Failed to load agendas for date range: ${startDate} - ${endDate}`,
        );
      }
      const agendas = (await this.parseJson<any[]>(response)) || [];

      return agendas.map((agenda) => {
        const items = (agenda.items || []).map((item: any) =>
          this.mapEnrichedItemToAgendaItem(item),
        );

        const scheduledItems = items.map((item: AgendaItem) => ({
          agendaItem: item,
          task: this.buildTaskFromAgendaItem(item),
          boardId: item.board_id,
          projectId: item.project_id,
          projectName: item.project_name || "",
          boardName: item.board_name || "",
          columnName: item.column_name || null,
          isOrphaned: !item.task_id,
        }));

        const regularTasks = scheduledItems.filter(
          (si) => si.agendaItem.task_type === "regular",
        );
        const meetings = scheduledItems.filter(
          (si) => si.agendaItem.task_type === "meeting",
        );
        const milestones = scheduledItems.filter(
          (si) => si.agendaItem.task_type === "milestone",
        );

        return {
          date: agenda.date || startDate,
          items: scheduledItems,
          regularTasks,
          meetings,
          milestones,
          orphanedItems: scheduledItems.filter((si) => si.isOrphaned),
          tasks: regularTasks,
        };
      });
    } catch (error) {
      logger.error("Failed to load agendas for date range:", error);
      throw error;
    }
  }

  private buildTaskFromAgendaItem(item: AgendaItem): any {
    if (!item.task_id) {
      return null;
    }

    return {
      id: item.task_id,
      title: item.task_title || item.task_id,
      column_id: item.column_id || "",
      description: item.task_description || "",
      project_id: item.project_id,
      task_type: item.task_type,
      priority: item.task_priority || "none",
      goal_id: item.task_goal_id || null,
      meeting_data: item.meeting_data,
    };
  }

  async loadAgendaItemById(agendaItemId: string): Promise<AgendaItem | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${agendaItemId}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`Failed to load agenda item: ${agendaItemId}`);
      }
      const data = await this.parseJson<Record<string, any>>(response);
      if (!data) {
        return null;
      }
      return AgendaItem.fromDict(data);
    } catch (error) {
      logger.error("Failed to load agenda item by id:", error);
      throw error;
    }
  }

  async loadAllAgendaItems(): Promise<AgendaItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/all`);
      if (!response.ok) {
        throw new Error("Failed to load all agenda items");
      }
      const data = (await this.parseJson<any[]>(response)) || [];
      return data.map((item: any) => AgendaItem.fromDict(item));
    } catch (error) {
      logger.error("Failed to load all agenda items:", error);
      throw error;
    }
  }

  async saveAgendaItem(item: AgendaItem): Promise<void> {
    try {
      const method =
        item.id && item.id.startsWith("agenda-") && !item.id.includes("backend")
          ? "POST"
          : "PUT";
      const url =
        method === "POST" ? `${this.baseUrl}` : `${this.baseUrl}/${item.id}`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item.toDict()),
      });

      if (!response.ok) {
        throw new Error(`Failed to save agenda item: ${item.id}`);
      }

      if (method === "POST") {
        const savedItem = await this.parseJson<Record<string, any>>(response);
        if (savedItem?.id) {
          item.id = savedItem.id;
        }
      }
    } catch (error) {
      logger.error("Failed to save agenda item:", error);
      throw error;
    }
  }

  async deleteAgendaItem(item: AgendaItem): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${item.id}`, {
        method: "DELETE",
      });

      if (response.status === 404) {
        return false;
      }

      if (!response.ok) {
        throw new Error(`Failed to delete agenda item: ${item.id}`);
      }

      return true;
    } catch (error) {
      logger.error("Failed to delete agenda item:", error);
      throw error;
    }
  }

  async getOrphanedAgendaItems(): Promise<AgendaItem[]> {
    try {
      const response = await fetch(`${this.itemsBaseUrl}/orphaned`);
      if (!response.ok) {
        throw new Error("Failed to load orphaned agenda items");
      }
      const data = (await this.parseJson<any[]>(response)) || [];
      return data.map((item: any) => this.mapEnrichedItemToAgendaItem(item));
    } catch (error) {
      logger.error("Failed to load orphaned agenda items:", error);
      throw error;
    }
  }

  async getOverdueAgendaItems(): Promise<AgendaItem[]> {
    try {
      const response = await fetch(`${this.itemsBaseUrl}/overdue`);
      if (!response.ok) {
        throw new Error("Failed to load overdue agenda items");
      }
      const data = (await this.parseJson<any[]>(response)) || [];
      return data.map((item: any) => this.mapEnrichedItemToAgendaItem(item));
    } catch (error) {
      logger.error("Failed to load overdue agenda items:", error);
      throw error;
    }
  }

  async getUpcomingAgendaItems(days: number = 7): Promise<AgendaItem[]> {
    try {
      const response = await fetch(
        `${this.itemsBaseUrl}/upcoming?days=${days}`,
      );
      if (!response.ok) {
        throw new Error("Failed to load upcoming agenda items");
      }
      const data = (await this.parseJson<any[]>(response)) || [];
      return data.map((item: any) => this.mapEnrichedItemToAgendaItem(item));
    } catch (error) {
      logger.error("Failed to load upcoming agenda items:", error);
      throw error;
    }
  }

  async loadUnfinishedItems(beforeDate?: string): Promise<AgendaItem[]> {
    try {
      const url = beforeDate
        ? `${this.itemsBaseUrl}/unfinished?beforeDate=${beforeDate}`
        : `${this.itemsBaseUrl}/unfinished`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to load unfinished agenda items");
      }
      const data = (await this.parseJson<any[]>(response)) || [];
      return data.map((item: any) => this.mapEnrichedItemToAgendaItem(item));
    } catch (error) {
      logger.error("Failed to load unfinished agenda items:", error);
      throw error;
    }
  }

  async searchAgendaItems(query: string, mode: 'all' | 'unfinished'): Promise<any[]> {
    try {
      const url = `${this.itemsBaseUrl}/search?query=${encodeURIComponent(query)}&mode=${mode}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to search agenda items");
      }
      const data = (await this.parseJson<any[]>(response)) || [];
      return data.map((item: any) => {
        const agendaItem = this.mapEnrichedItemToAgendaItem(item);
        return {
          agendaItem,
          task: this.buildTaskFromAgendaItem(agendaItem),
          boardId: agendaItem.board_id,
          projectId: agendaItem.project_id,
          projectName: agendaItem.project_name || "",
          boardName: agendaItem.board_name || "",
          columnName: agendaItem.column_name || null,
          isOrphaned: !agendaItem.task_id,
        };
      });
    } catch (error) {
      logger.error("Failed to search agenda items:", error);
      throw error;
    }
  }

  async completeAgendaItem(
    itemId: string,
    completedAt?: Date,
    notes?: string,
  ): Promise<AgendaItem> {
    try {
      const item = await this.loadAgendaItemById(itemId);
      if (!item) {
        throw new Error(`Agenda item not found: ${itemId}`);
      }

      const response = await fetch(
        `${this.agendaBaseUrl}/${item.agenda_id}/items/${itemId}/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completedAt: completedAt?.toISOString(),
            notes,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to complete agenda item: ${itemId}`);
      }

      const data = await this.parseJson<Record<string, any>>(response);
      if (!data) {
        return item;
      }
      return AgendaItem.fromDict(data);
    } catch (error) {
      logger.error("Failed to complete agenda item:", error);
      throw error;
    }
  }

  async rescheduleAgendaItem(
    itemId: string,
    newDate: string,
    startAt?: Date | null,
    duration?: number | null,
  ): Promise<AgendaItem> {
    try {
      const item = await this.loadAgendaItemById(itemId);
      if (!item) {
        throw new Error(`Agenda item not found: ${itemId}`);
      }

      const response = await fetch(
        `${this.agendaBaseUrl}/${item.agenda_id}/items/${itemId}/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newDate,
            startAt: startAt?.toISOString(),
            duration,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to reschedule agenda item: ${itemId}`);
      }

      const data = await this.parseJson<Record<string, any>>(response);
      if (!data) {
        return item;
      }
      return AgendaItem.fromDict(data);
    } catch (error) {
      logger.error("Failed to reschedule agenda item:", error);
      throw error;
    }
  }

  private mapEnrichedItemToAgendaItem(enrichedItem: any): AgendaItem {
    const task = enrichedItem.task || {};
    const rawTaskType = task.taskType || task.type || enrichedItem.taskType;
    const taskType =
      typeof rawTaskType === "string"
        ? (rawTaskType.toLowerCase() === "meeting"
            ? "meeting"
            : rawTaskType.toLowerCase() === "milestone"
            ? "milestone"
            : "regular")
        : undefined;
    const rawPriority = task.priority || enrichedItem.priority;
    let taskPriority: string | null = null;
    if (typeof rawPriority === "string") {
      const normalized = rawPriority.toLowerCase();
      if (normalized === "urgent") {
        taskPriority = "high";
      } else if (["high", "medium", "low", "none"].includes(normalized)) {
        taskPriority = normalized;
      }
    }

    return AgendaItem.fromDict({
      id: enrichedItem.id,
      agenda_id: enrichedItem.agendaId || enrichedItem.agenda_id || null,
      task_id: task.id || enrichedItem.taskId,
      project_id: task.projectId || enrichedItem.projectId,
      board_id: task.boardId || enrichedItem.boardId,
      column_id: task.columnId || enrichedItem.columnId || null,
      task_title: task.title || enrichedItem.taskTitle,
      task_description: task.description || enrichedItem.taskDescription,
      task_goal_id: task.goalId || enrichedItem.goalId || null,
      task_priority: taskPriority,
      project_name: task.projectName || enrichedItem.projectName || "",
      board_name: task.boardName || enrichedItem.boardName || "",
      column_name: task.columnName || enrichedItem.columnName || null,
      scheduled_date: enrichedItem.startAt
        ? new Date(enrichedItem.startAt).toISOString().split("T")[0]
        : enrichedItem.scheduledDate || "",
      scheduled_time: enrichedItem.startAt
        ? new Date(enrichedItem.startAt).toTimeString().slice(0, 5)
        : enrichedItem.scheduledTime || undefined,
      duration_minutes: enrichedItem.duration_minutes ?? enrichedItem.duration ?? null,
      task_type: taskType,
      status: enrichedItem.status,
      position: enrichedItem.position,
      notes: enrichedItem.notes,
      notification_id: enrichedItem.notificationId,
      is_unfinished: enrichedItem.status === "UNFINISHED",
      completed_at: enrichedItem.completedAt,
    });
  }
}
