import { useState, useCallback } from 'react';
import { Routine } from '../domain/entities/Routine';

export interface UseRoutineModalsReturn {
  showCreateModal: boolean;
  showEditModal: boolean;
  editingRoutine: Routine | null;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (routine: Routine) => void;
  closeEditModal: () => void;
}

export function useRoutineModals(): UseRoutineModalsReturn {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  const openCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const openEditModal = useCallback((routine: Routine) => {
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
