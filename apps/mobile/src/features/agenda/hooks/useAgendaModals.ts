import { useState, useCallback } from 'react';

export function useAgendaModals() {
  const [showFormModal, setShowFormModal] = useState(false);
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  const openFormModal = useCallback(() => setShowFormModal(true), []);
  const closeFormModal = useCallback(() => setShowFormModal(false), []);

  const openTaskSelector = useCallback(() => setShowTaskSelector(true), []);
  const closeTaskSelector = useCallback(() => setShowTaskSelector(false), []);

  const openTaskSelectorThenForm = useCallback(() => {
    closeTaskSelector();
    openFormModal();
  }, [closeTaskSelector, openFormModal]);

  return {
    showFormModal,
    showTaskSelector,
    openFormModal,
    closeFormModal,
    openTaskSelector,
    closeTaskSelector,
    openTaskSelectorThenForm,
  };
}
