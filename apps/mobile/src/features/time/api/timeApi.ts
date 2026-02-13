import { apiClient } from '@infrastructure/api/apiClient';
import { createTimeApi } from '@cadence/api';

export const timeApi = createTimeApi(apiClient);
