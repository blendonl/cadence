import { apiClient } from '@infrastructure/api/apiClient';
import { createProjectApi } from '@cadence/api';

export const projectApi = createProjectApi(apiClient);
