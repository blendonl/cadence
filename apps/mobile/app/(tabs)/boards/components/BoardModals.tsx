import React from "react";
import MoveToColumnModal from "@/features/boards/components/MoveToColumnModal";
import ColumnFormModal from "@/features/boards/components/ColumnFormModal";
import ColumnActionsModal from "@/features/boards/components/ColumnActionsModal";
import { Column } from "@/features/boards/domain/entities/Column";

interface BoardModalsProps {
  columns: Column[];
  modals: {
    selectedTask: any;
    selectedColumn: Column | null;
    editingColumn: Column | null;
    showMoveModal: boolean;
    showColumnForm: boolean;
    showColumnActions: boolean;
    closeMoveModal: () => void;
    closeColumnForm: () => void;
    closeColumnActions: () => void;
  };
  columnActions: {
    handleSaveColumn: (name: string, position?: number) => void;
    handleRenameColumn: (column: Column) => void;
    handleMoveColumn: (column: Column, direction: "left" | "right") => void;
    handleClearColumn: (column: Column) => void;
    handleMoveAllTasks: (column: Column) => void;
    handleDeleteColumn: (column: Column) => void;
  };
  taskActions: {
    handleMoveToColumn: (task: any, targetColumnId: string) => void;
  };
}

export default function BoardModals({
  columns,
  modals,
  columnActions,
  taskActions,
}: BoardModalsProps) {
  const getColumnIndex = (columnId: string) => {
    return columns.findIndex((c) => c.id === columnId);
  };

  return (
    <>
      {modals.selectedTask && (
        <MoveToColumnModal
          visible={modals.showMoveModal}
          columns={columns}
          currentColumnId={modals.selectedTask.column_id}
          onSelectColumn={(targetColumnId) =>
            taskActions.handleMoveToColumn(modals.selectedTask, targetColumnId)
          }
          onClose={modals.closeMoveModal}
        />
      )}

      <ColumnFormModal
        visible={modals.showColumnForm}
        column={modals.editingColumn}
        existingColumns={columns}
        onSave={columnActions.handleSaveColumn}
        onClose={modals.closeColumnForm}
      />

      {modals.selectedColumn && (
        <ColumnActionsModal
          visible={modals.showColumnActions}
          column={modals.selectedColumn}
          canMoveLeft={getColumnIndex(modals.selectedColumn.id) > 0}
          canMoveRight={getColumnIndex(modals.selectedColumn.id) < columns.length - 1}
          onClose={modals.closeColumnActions}
          onRename={() => columnActions.handleRenameColumn(modals.selectedColumn!)}
          onMoveLeft={() => columnActions.handleMoveColumn(modals.selectedColumn!, "left")}
          onMoveRight={() => columnActions.handleMoveColumn(modals.selectedColumn!, "right")}
          onClearTasks={() => columnActions.handleClearColumn(modals.selectedColumn!)}
          onMoveAllTasks={() => columnActions.handleMoveAllTasks(modals.selectedColumn!)}
          onDelete={() => columnActions.handleDeleteColumn(modals.selectedColumn!)}
        />
      )}
    </>
  );
}
