import React, { createContext, useContext, ReactNode, useRef } from 'react';
import { FlatList } from 'react-native';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

export interface DragPosition {
  x: number;
  y: number;
}

export interface BoardDragState {
  draggedTaskId: SharedValue<string | null>;
  dragPosition: SharedValue<DragPosition>;
  isDragging: SharedValue<boolean>;
  targetColumnId: SharedValue<string | null>;
  targetIndex: SharedValue<number>;
  activeColumnId: SharedValue<string | null>;
}

export interface BoardDragContextValue extends BoardDragState {
  horizontalScrollRef: React.RefObject<FlatList | null> | null;
  setHorizontalScrollRef: (ref: React.RefObject<FlatList | null>) => void;
  startDrag: (taskId: string, initialPosition: DragPosition) => void;
  updatePosition: (position: DragPosition) => void;
  updateTarget: (columnId: string | null, index: number) => void;
  endDrag: () => void;
}

const BoardDragContext = createContext<BoardDragContextValue | null>(null);

interface BoardDragProviderProps {
  children: ReactNode;
}

export const BoardDragProvider: React.FC<BoardDragProviderProps> = ({ children }) => {
  const draggedTaskId = useSharedValue<string | null>(null);
  const dragPosition = useSharedValue<DragPosition>({ x: 0, y: 0 });
  const isDragging = useSharedValue<boolean>(false);
  const targetColumnId = useSharedValue<string | null>(null);
  const targetIndex = useSharedValue<number>(-1);
  const activeColumnId = useSharedValue<string | null>(null);
  const horizontalScrollRefInternal = useRef<React.RefObject<FlatList | null> | null>(null);

  const startDrag = (taskId: string, initialPosition: DragPosition) => {
    console.log('[BoardDragContext] startDrag', taskId, initialPosition);
    draggedTaskId.value = taskId;
    dragPosition.value = initialPosition;
    isDragging.value = true;
    targetColumnId.value = null;
    targetIndex.value = -1;
  };

  const updatePosition = (position: DragPosition) => {
    dragPosition.value = position;
  };

  const updateTarget = (columnId: string | null, index: number) => {
    console.log('[BoardDragContext] updateTarget', columnId, index);
    targetColumnId.value = columnId;
    targetIndex.value = index;
  };

  const endDrag = () => {
    console.log('[BoardDragContext] endDrag');
    isDragging.value = false;
    draggedTaskId.value = null;
    targetColumnId.value = null;
    targetIndex.value = -1;
    activeColumnId.value = null;
  };

  const setHorizontalScrollRef = (ref: React.RefObject<FlatList | null>) => {
    horizontalScrollRefInternal.current = ref;
  };

  const contextValue: BoardDragContextValue = {
    draggedTaskId,
    dragPosition,
    isDragging,
    targetColumnId,
    targetIndex,
    activeColumnId,
    horizontalScrollRef: horizontalScrollRefInternal.current,
    setHorizontalScrollRef,
    startDrag,
    updatePosition,
    updateTarget,
    endDrag,
  };

  return (
    <BoardDragContext.Provider value={contextValue}>
      {children}
    </BoardDragContext.Provider>
  );
};

export const useBoardDrag = (): BoardDragContextValue => {
  const context = useContext(BoardDragContext);
  if (!context) {
    throw new Error('useBoardDrag must be used within BoardDragProvider');
  }
  return context;
};
