import { useRef, useCallback } from "react";
import { FlatList, Dimensions } from "react-native";
import {
  SharedValue,
  useAnimatedReaction,
  runOnJS,
  useSharedValue,
} from "react-native-reanimated";
import { DragPosition } from "../components/drag-drop/BoardDragContext";

interface UseAutoScrollOptions {
  dragPosition: SharedValue<DragPosition>;
  isDragging: SharedValue<boolean>;
  activeColumnId: SharedValue<string | null>;
  horizontalScrollRef?: React.RefObject<FlatList | null>;
  horizontalEdgeThreshold?: number;
  verticalEdgeThreshold?: number;
  scrollSpeed?: number;
}

interface VerticalScrollInfo {
  ref: React.RefObject<FlatList | null>;
  contentHeight: number;
  viewportHeight: number;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAG_OVERLAY_HALF_WIDTH = 160;
const DEFAULT_HORIZONTAL_THRESHOLD = 80;
const DEFAULT_VERTICAL_THRESHOLD = 60;
const DEFAULT_SCROLL_SPEED = 24;
const SCROLL_INTERVAL = 16;

export function useAutoScroll({
  dragPosition,
  isDragging,
  activeColumnId,
  horizontalScrollRef,
  horizontalEdgeThreshold = DEFAULT_HORIZONTAL_THRESHOLD,
  verticalEdgeThreshold = DEFAULT_VERTICAL_THRESHOLD,
  scrollSpeed = DEFAULT_SCROLL_SPEED,
}: UseAutoScrollOptions) {
  const verticalScrollRefs = useRef<Map<string, VerticalScrollInfo>>(new Map());
  const horizontalScrollOffset = useSharedValue(0);
  const horizontalContentWidth = useSharedValue(0);
  const horizontalViewportWidth = useSharedValue(SCREEN_WIDTH);
  const lastScrollTime = useRef(0);

  const scrollHorizontal = useCallback(
    (amount: number) => {
      const now = Date.now();
      if (now - lastScrollTime.current < SCROLL_INTERVAL) return;
      lastScrollTime.current = now;

      if (!horizontalScrollRef?.current) return;

      const maxOffset = Math.max(
        0,
        horizontalContentWidth.value - horizontalViewportWidth.value,
      );
      if (maxOffset <= 0) return;

      if (amount < 0 && horizontalScrollOffset.value <= 0) return;
      if (amount > 0 && horizontalScrollOffset.value >= maxOffset) return;

      const newOffset = Math.min(
        maxOffset,
        Math.max(0, horizontalScrollOffset.value + amount),
      );
      if (newOffset === horizontalScrollOffset.value) return;

      horizontalScrollRef.current.scrollToOffset({
        offset: newOffset,
        animated: true,
      });
      horizontalScrollOffset.value = newOffset;
    },
    [horizontalScrollRef],
  );

  const scrollVertical = useCallback((columnId: string, amount: number) => {
    const now = Date.now();
    if (now - lastScrollTime.current < SCROLL_INTERVAL) return;
    lastScrollTime.current = now;

    const scrollInfo = verticalScrollRefs.current.get(columnId);
    if (!scrollInfo?.ref.current) return;

    const { contentHeight, viewportHeight } = scrollInfo;
    if (contentHeight <= viewportHeight) return;

    scrollInfo.ref.current.scrollToOffset({
      offset: amount,
      animated: true,
    });
  }, []);

  const handleVerticalAutoScroll = useCallback(
    (columnId: string, y: number) => {
      const scrollInfo = verticalScrollRefs.current.get(columnId);
      if (!scrollInfo) return;

      const { viewportHeight } = scrollInfo;
      if (viewportHeight <= 0) return;

      const topEdgeDistance = y;
      const bottomEdgeDistance = viewportHeight - y;

      if (topEdgeDistance < verticalEdgeThreshold) {
        const intensity = Math.min(
          1,
          1 - topEdgeDistance / verticalEdgeThreshold,
        );
        const scrollAmount = -scrollSpeed * intensity;
        scrollVertical(columnId, scrollAmount);
      } else if (bottomEdgeDistance < verticalEdgeThreshold) {
        const intensity = Math.min(
          1,
          1 - bottomEdgeDistance / verticalEdgeThreshold,
        );
        const scrollAmount = scrollSpeed * intensity;
        scrollVertical(columnId, scrollAmount);
      }
    },
    [scrollSpeed, scrollVertical, verticalEdgeThreshold],
  );

  useAnimatedReaction(
    () => {
      if (!isDragging.value) return null;

      const current = dragPosition.value;
      return {
        x: current.x,
        y: current.y,
        activeColumn: activeColumnId.value,
      };
    },
    (result) => {
      if (!result) return;

      const { x, y, activeColumn } = result;

      const viewportWidth = horizontalViewportWidth.value || SCREEN_WIDTH;
      const leftEdgeDistance = x - DRAG_OVERLAY_HALF_WIDTH;
      const rightEdgeDistance = viewportWidth - (x + DRAG_OVERLAY_HALF_WIDTH);

      if (leftEdgeDistance < horizontalEdgeThreshold) {
        const intensity = Math.min(
          1,
          1 - leftEdgeDistance / horizontalEdgeThreshold,
        );
        const scrollAmount = -scrollSpeed * intensity;
        runOnJS(scrollHorizontal)(scrollAmount);
      } else if (rightEdgeDistance < horizontalEdgeThreshold) {
        const intensity = Math.min(
          1,
          1 - rightEdgeDistance / horizontalEdgeThreshold,
        );
        const scrollAmount = scrollSpeed * intensity;
        runOnJS(scrollHorizontal)(scrollAmount);
      }

      if (activeColumn) {
        runOnJS(handleVerticalAutoScroll)(activeColumn, y);
      }
    },
    [
      isDragging,
      dragPosition,
      activeColumnId,
      horizontalEdgeThreshold,
      verticalEdgeThreshold,
      scrollSpeed,
      scrollHorizontal,
      handleVerticalAutoScroll,
      horizontalViewportWidth,
    ],
  );

  const handleHorizontalScroll = useCallback(
    (offset: number, contentWidth?: number, viewportWidth?: number) => {
      horizontalScrollOffset.value = offset;
      if (typeof contentWidth === 'number' && !Number.isNaN(contentWidth)) {
        horizontalContentWidth.value = contentWidth;
      }
      if (typeof viewportWidth === 'number' && !Number.isNaN(viewportWidth)) {
        horizontalViewportWidth.value = viewportWidth;
      }
    },
    [horizontalContentWidth, horizontalScrollOffset, horizontalViewportWidth],
  );

  const handleHorizontalContentSize = useCallback(
    (width: number) => {
      horizontalContentWidth.value = width;
    },
    [horizontalContentWidth],
  );

  const handleHorizontalLayout = useCallback(
    (width: number) => {
      horizontalViewportWidth.value = width;
    },
    [horizontalViewportWidth],
  );

  const registerVerticalScroll = useCallback(
    (
      columnId: string,
      ref: React.RefObject<FlatList | null>,
      contentHeight: number,
      viewportHeight: number,
    ) => {
      verticalScrollRefs.current.set(columnId, {
        ref,
        contentHeight,
        viewportHeight,
      });
    },
    [],
  );

  const unregisterVerticalScroll = useCallback((columnId: string) => {
    verticalScrollRefs.current.delete(columnId);
  }, []);

  return {
    handleHorizontalScroll,
    handleHorizontalContentSize,
    handleHorizontalLayout,
    registerVerticalScroll,
    unregisterVerticalScroll,
  };
}
