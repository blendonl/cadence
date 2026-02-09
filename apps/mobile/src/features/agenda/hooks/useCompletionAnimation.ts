import { useCallback } from 'react';
import { useSharedValue, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { TIMING_CONFIG } from '@shared/utils/animations';

export function useCompletionAnimation() {
  const scale = useSharedValue(1);

  const triggerCompletion = useCallback(async () => {
    scale.value = withSequence(
      withTiming(1.15, TIMING_CONFIG.fast),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [scale]);

  return { scale, triggerCompletion };
}
