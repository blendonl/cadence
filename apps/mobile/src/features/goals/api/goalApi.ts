import { apiClient } from '@infrastructure/api/apiClient';
import { createGoalApi } from '@cadence/api';

export const goalApi = createGoalApi(apiClient);
