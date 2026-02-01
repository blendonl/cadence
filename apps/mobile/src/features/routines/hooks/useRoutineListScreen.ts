import { useRoutineListData } from './useRoutineListData';
import { useRoutineModals } from './useRoutineModals';
import { useRoutineActions } from './useRoutineActions';
import { RoutineDetailDto, RoutineUpdateRequestDto } from 'shared-types';

export interface UseRoutineListScreenReturn {
  viewState: {
    routines: RoutineDetailDto[];
    loading: boolean;
  };
  modals: {
    showCreateModal: boolean;
    showEditModal: boolean;
    editingRoutine: RoutineDetailDto | null;
    openCreateModal: () => void;
    closeCreateModal: () => void;
    openEditModal: (routine: RoutineDetailDto) => void;
    closeEditModal: () => void;
  };
  actions: {
    handleCreateRoutine: (
      name: string,
      type: 'SLEEP' | 'STEP' | 'OTHER',
      target: string,
      separateInto?: number,
      repeatIntervalMinutes?: number,
      activeDays?: string[]
    ) => Promise<void>;
    handleUpdateRoutine: (id: string, updates: RoutineUpdateRequestDto) => Promise<void>;
    handleDeleteRoutine: (id: string) => Promise<void>;
    handleToggleStatus: (id: string, currentStatus: string) => Promise<void>;
  };
  refresh: () => Promise<void>;
}

export function useRoutineListScreen(): UseRoutineListScreenReturn {
  const data = useRoutineListData();
  const modals = useRoutineModals();
  const actions = useRoutineActions({
    refreshRoutines: data.refresh,
    closeModal: modals.closeCreateModal,
  });

  return {
    viewState: {
      routines: data.routines,
      loading: data.loading,
    },
    modals,
    actions,
    refresh: data.refresh,
  };
}
