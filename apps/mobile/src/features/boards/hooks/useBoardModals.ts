import { useState, useCallback } from 'react';
import { Task } from '../domain/entities/Task';
import { Column } from '../domain/entities/Column';

export function useBoardModals() {
  // Task Move Modal
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Column Form Modal
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);

  // Column Actions Modal
  const [showColumnActions, setShowColumnActions] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);

  // Task Move Modal handlers
  const openMoveModal = useCallback((task: Task) => {
    setSelectedTask(task);
    setShowMoveModal(true);
  }, []);

  const closeMoveModal = useCallback(() => {
    setShowMoveModal(false);
    setSelectedTask(null);
  }, []);

  // Column Form Modal handlers
  const openColumnFormForCreate = useCallback(() => {
    setEditingColumn(null);
    setShowColumnForm(true);
  }, []);

  const openColumnFormForEdit = useCallback((column: Column) => {
    setEditingColumn(column);
    setShowColumnForm(true);
  }, []);

  const closeColumnForm = useCallback(() => {
    setShowColumnForm(false);
    setEditingColumn(null);
  }, []);

  // Column Actions Modal handlers
  const openColumnActions = useCallback((column: Column) => {
    setSelectedColumn(column);
    setShowColumnActions(true);
  }, []);

  const closeColumnActions = useCallback(() => {
    setShowColumnActions(false);
    setSelectedColumn(null);
  }, []);

  return {
    // Task Move Modal
    showMoveModal,
    selectedTask,
    openMoveModal,
    closeMoveModal,

    // Column Form Modal
    showColumnForm,
    editingColumn,
    openColumnFormForCreate,
    openColumnFormForEdit,
    closeColumnForm,

    // Column Actions Modal
    showColumnActions,
    selectedColumn,
    openColumnActions,
    closeColumnActions,
  };
}
