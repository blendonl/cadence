import { webApiClient } from './api-client';
import {
  createProjectApi,
  createBoardApi,
  createColumnApi,
  createTaskApi,
  createAgendaApi,
  createNoteApi,
  createGoalApi,
  createRoutineApi,
  createTimeApi,
} from '@cadence/api';

export const projectApi = createProjectApi(webApiClient);
export const boardApi = createBoardApi(webApiClient);
export const columnApi = createColumnApi(webApiClient);
export const taskApi = createTaskApi(webApiClient);
export const agendaApi = createAgendaApi(webApiClient);
export const noteApi = createNoteApi(webApiClient);
export const goalApi = createGoalApi(webApiClient);
export const routineApi = createRoutineApi(webApiClient);
export const timeApi = createTimeApi(webApiClient);
