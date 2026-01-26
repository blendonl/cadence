import { useBoardData } from './useBoardData';
import { useBoardModals } from './useBoardModals';
import { useBoardNavigation } from './useBoardNavigation';
import { useColumnActions } from './useColumnActions';
import { useTaskActions } from './useTaskActions';

export function useBoardScreen(boardId: string | undefined) {
  // Sub-hooks
  const data = useBoardData(boardId);
  const modals = useBoardModals();

  // Navigation effects
  useBoardNavigation({
    board: data.board,
    refreshBoard: data.refreshBoard,
  });

  // Business logic hooks
  const columnActions = useColumnActions({
    board: data.board,
    refreshBoard: data.refreshBoard,
    openColumnFormForCreate: modals.openColumnFormForCreate,
    openColumnFormForEdit: modals.openColumnFormForEdit,
    closeColumnForm: modals.closeColumnForm,
    openMoveModal: modals.openMoveModal,
    closeColumnActions: modals.closeColumnActions,
  });

  const taskActions = useTaskActions({
    board: data.board,
    refreshBoard: data.refreshBoard,
    openMoveModal: modals.openMoveModal,
    closeMoveModal: modals.closeMoveModal,
  });

  // Return clean interface for component
  return {
    // View state
    viewState: {
      board: data.board,
      loading: data.loading,
    },

    // Modals
    modals: {
      // Task Move Modal
      showMoveModal: modals.showMoveModal,
      selectedTask: modals.selectedTask,
      closeMoveModal: modals.closeMoveModal,

      // Column Form Modal
      showColumnForm: modals.showColumnForm,
      editingColumn: modals.editingColumn,
      closeColumnForm: modals.closeColumnForm,

      // Column Actions Modal
      showColumnActions: modals.showColumnActions,
      selectedColumn: modals.selectedColumn,
      closeColumnActions: modals.closeColumnActions,
    },

    // Column actions
    columnActions: {
      handleCreateColumn: columnActions.handleCreateColumn,
      handleSaveColumn: columnActions.handleSaveColumn,
      handleColumnMenu: modals.openColumnActions,
      handleRenameColumn: columnActions.handleRenameColumn,
      handleMoveColumn: columnActions.handleMoveColumn,
      handleClearColumn: columnActions.handleClearColumn,
      handleMoveAllTasks: columnActions.handleMoveAllTasks,
      handleDeleteColumn: columnActions.handleDeleteColumn,
    },

    // Task actions
    taskActions: {
      handleTaskPress: taskActions.handleTaskPress,
      handleTaskLongPress: taskActions.handleTaskLongPress,
      handleMoveToColumn: taskActions.handleMoveToColumn,
      handleAddItem: taskActions.handleAddItem,
    },
  };
}
