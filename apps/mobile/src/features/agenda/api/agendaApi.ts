import { apiClient } from '@infrastructure/api/apiClient';
import { createAgendaApi } from '@cadence/api';

export const agendaApi = createAgendaApi(apiClient);
