import { useRoutineListData } from './useRoutineListData';
import { useRoutineModals } from './useRoutineModals';
import { useRoutineActions } from './useRoutineActions';
import { Routine } from '../domain/entities/Routine';

export interface UseRoutineListScreenReturn {
  viewState: {
    routines: Routine[];
    loading: boolean;
  };
  modals: {
    showCreateModal: boolean;
    showEditModal: boolean;
    editingRoutine: Routine | null;
    openCreateModal: () => void;
    closeCreateModal: () => void;
    openEditModal: (routine: Routine) => void;
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
    handleUpdateRoutine: (id: string, updates: any) => Promise<void>;
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
