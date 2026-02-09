import { Easing, WithTimingConfig } from 'react-native-reanimated';

export const TIMING_CONFIG = {
  fast: {
    duration: 200,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } satisfies WithTimingConfig,
  normal: {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } satisfies WithTimingConfig,
  slow: {
    duration: 500,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } satisfies WithTimingConfig,
  spring: {
    duration: 400,
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  } satisfies WithTimingConfig,
};

export const STAGGER_DELAY = 50;

export const ENTRANCE_OFFSET = 20;
