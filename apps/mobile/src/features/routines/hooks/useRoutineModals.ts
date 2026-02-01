import { useState, useCallback } from 'react';
import { RoutineDetailDto } from 'shared-types';

export interface UseRoutineModalsReturn {
  showCreateModal: boolean;
  showEditModal: boolean;
  editingRoutine: RoutineDetailDto | null;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (routine: RoutineDetailDto) => void;
  closeEditModal: () => void;
}

export function useRoutineModals(): UseRoutineModalsReturn {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineDetailDto | null>(null);

  const openCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const openEditModal = useCallback((routine: RoutineDetailDto) => {
    setEditingRoutine(routine);
    setShowEditModal(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingRoutine(null);
  }, []);

  return {
    showCreateModal,
    showEditModal,
    editingRoutine,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
  };
}
