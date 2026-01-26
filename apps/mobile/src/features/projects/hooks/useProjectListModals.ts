import { useState, useCallback } from 'react';

export interface UseProjectListModalsReturn {
  showCreateModal: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
}

export function useProjectListModals(): UseProjectListModalsReturn {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const openCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  return {
    showCreateModal,
    openCreateModal,
    closeCreateModal,
  };
}
