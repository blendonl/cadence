import { useRef, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';
import { AgendaViewMode } from 'shared-types';

const VIEW_ORDER: AgendaViewMode[] = ['day', 'week', 'month'];

export function useViewTransition(viewMode: AgendaViewMode, loading: boolean) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const prevMode = useRef(viewMode);
  const pendingTransition = useRef<number | null>(null);

  useEffect(() => {
    if (prevMode.current === viewMode) return;

    const prevIndex = VIEW_ORDER.indexOf(prevMode.current);
    const nextIndex = VIEW_ORDER.indexOf(viewMode);
    const direction = nextIndex > prevIndex ? 1 : -1;

    prevMode.current = viewMode;
    pendingTransition.current = direction;

    fadeAnim.setValue(0);
    translateAnim.setValue(0);
  }, [viewMode, fadeAnim, translateAnim]);

  useEffect(() => {
    if (loading || pendingTransition.current === null) return;

    const direction = pendingTransition.current;
    pendingTransition.current = null;

    translateAnim.setValue(direction * 30);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [loading, fadeAnim, translateAnim]);

  const transitionStyle = {
    opacity: fadeAnim,
    transform: [{ translateX: translateAnim }],
  };

  return { transitionStyle };
}
