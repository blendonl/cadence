import { BoardId, ProjectId, TaskId, NoteId, GoalId, TimeLogId } from "@core/types";
import { TaskDto } from "shared-types";
import { TaskScheduleFields } from "@features/tasks/types/taskSchedule";

export type RootStackParamList = {
  ProjectList: undefined;
  ProjectDetail: { projectId: ProjectId };
  BoardList: { projectId: ProjectId };
  Board: { boardId: BoardId; projectId: ProjectId };
  TaskDetail: { taskId: TaskId; boardId: BoardId; projectId: ProjectId };
  AgendaDay: { date: string };
  AgendaItemDetail: { agendaId: string; itemId: string };
  TaskSchedule: { taskId: TaskId; boardId: BoardId };
  NotesList: undefined;
  NoteEditor: { noteId?: NoteId };
  GoalsList: undefined;
  GoalDetail: { goalId: GoalId };
  TimeOverview: undefined;
  TimeLogDetail: { logId: TimeLogId };
  Settings: undefined;
};

export type AgendaStackParamList = {
  AgendaMain: undefined;
  AgendaDay: { date: string };
  AgendaItemDetail: { agendaId: string; itemId: string };
  TaskSchedule: {
    taskId: TaskId;
    boardId: BoardId;
    taskData?: TaskDto & TaskScheduleFields;
    allowTypeEdit?: boolean;
  };
};
