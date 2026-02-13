import { apiClient } from '@infrastructure/api/apiClient';
import { createRoutineApi } from '@cadence/api';

export const routineApi = createRoutineApi(apiClient);
