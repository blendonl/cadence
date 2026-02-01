import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, NativeScrollEvent, NativeSyntheticEvent, Platform } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import theme from '@shared/theme';

interface ThemedTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  onDone?: () => void;
}

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const LIST_PADDING = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;

const HOURS = Array.from({ length: 24 }).map((_, index) => index);
const MINUTES = Array.from({ length: 60 }).map((_, index) => index);

export const ThemedTimePicker: React.FC<ThemedTimePickerProps> = ({
  value,
  onChange,
  onDone,
}) => {
  const { hour: initialHour, minute: initialMinute } = parseTime(value);
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  const hasInteracted = useRef(false);

  useEffect(() => {
    const parsed = parseTime(value);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    hasInteracted.current = false;
  }, [value]);

  useEffect(() => {
    if (!hasInteracted.current) return;
    onChange(formatTime(hour, minute));
  }, [hour, minute, onChange]);

  const handleSelect = useCallback((nextHour: number, nextMinute: number) => {
    hasInteracted.current = true;
    setHour(nextHour);
    setMinute(nextMinute);
  }, []);

  return (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.headerCell}>
          <Text style={styles.headerLabel}>Hour</Text>
        </View>
        <View style={styles.headerSpacer} />
        <View style={styles.headerCell}>
          <Text style={styles.headerLabel}>Minute</Text>
        </View>
      </View>
      <View style={styles.wheelsRow}>
        <WheelColumn
          data={HOURS}
          value={hour}
          onChange={next => handleSelect(next, minute)}
        />
        <Text style={styles.separator}>:</Text>
        <WheelColumn
          data={MINUTES}
          value={minute}
          onChange={next => handleSelect(hour, next)}
        />
      </View>
      {onDone && (
        <TouchableOpacity style={styles.doneButton} onPress={onDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface WheelColumnProps {
  data: number[];
  value: number;
  onChange: (value: number) => void;
}

const WheelColumn: React.FC<WheelColumnProps> = ({ data, value, onChange }) => {
  const listRef = useAnimatedRef<Animated.FlatList<number>>();
  const scrollY = useSharedValue(0);
  const isMomentum = useRef(false);

  useEffect(() => {
    const index = data.indexOf(value);
    if (index < 0) return;
    listRef.current?.scrollToOffset({
      offset: index * ITEM_HEIGHT,
      animated: false,
    });
    scrollY.value = index * ITEM_HEIGHT;
  }, [data, value, scrollY]);

  const handleMomentumBegin = () => {
    isMomentum.current = true;
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isMomentum.current = false;
    handleScrollEnd(event);
  };

  const handleDragEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isMomentum.current) return;
    handleScrollEnd(event);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const next = data[Math.max(0, Math.min(data.length - 1, index))];
    onChange(next);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleSelect = (index: number) => {
    const next = data[index];
    listRef.current?.scrollToOffset({
      offset: index * ITEM_HEIGHT,
      animated: true,
    });
    onChange(next);
  };

  const getItemLayout = useCallback(
    (_: number[] | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: number; index: number }) => (
      <WheelItem
        item={item}
        index={index}
        selected={item === value}
        scrollY={scrollY}
        onPress={() => handleSelect(index)}
      />
    ),
    [value, scrollY, handleSelect],
  );

  return (
    <View style={styles.wheelColumn}>
      <Animated.FlatList
        ref={listRef}
        data={data}
        keyExtractor={item => String(item)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        decelerationRate={Platform.OS === 'ios' ? 0.99 : 0.985}
        nestedScrollEnabled
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollBegin={handleMomentumBegin}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={handleDragEnd}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.wheelContent}
        style={styles.wheelList}
        bounces={false}
        overScrollMode="never"
        initialNumToRender={VISIBLE_ITEMS}
        windowSize={7}
      />
      <View pointerEvents="none" style={styles.wheelHighlight} />
    </View>
  );
};

interface WheelItemProps {
  item: number;
  index: number;
  selected: boolean;
  scrollY: Animated.SharedValue<number>;
  onPress: () => void;
}

const WheelItem: React.FC<WheelItemProps> = ({ item, index, selected, scrollY, onPress }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 2) * ITEM_HEIGHT,
      (index - 1) * ITEM_HEIGHT,
      index * ITEM_HEIGHT,
      (index + 1) * ITEM_HEIGHT,
      (index + 2) * ITEM_HEIGHT,
    ];
    return {
      transform: [
        {
          scale: interpolate(scrollY.value, inputRange, [0.88, 0.94, 1.06, 0.94, 0.88], Extrapolation.CLAMP),
        },
      ],
      opacity: interpolate(scrollY.value, inputRange, [0.4, 0.65, 1, 0.65, 0.4], Extrapolation.CLAMP),
    };
  });

  return (
    <TouchableOpacity style={styles.wheelItem} onPress={onPress}>
      <Animated.Text style={[styles.wheelText, selected && styles.wheelTextSelected, animatedStyle]}>
        {item.toString().padStart(2, '0')}
      </Animated.Text>
    </TouchableOpacity>
  );
};

function parseTime(value: string): { hour: number; minute: number } {
  if (!value) {
    return { hour: 9, minute: 0 };
  }

  const [hourStr, minuteStr] = value.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  return {
    hour: Number.isNaN(hour) ? 9 : Math.min(23, Math.max(0, hour)),
    minute: Number.isNaN(minute) ? 0 : Math.min(59, Math.max(0, minute)),
  };
}

function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerCell: {
    width: 92,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 12,
  },
  headerLabel: {
    color: theme.text.tertiary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  wheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  separator: {
    color: theme.text.secondary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: -2,
  },
  wheelColumn: {
    width: 92,
    height: LIST_HEIGHT,
    borderRadius: theme.radius.card,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.primary,
    overflow: 'hidden',
  },
  wheelList: {
    height: LIST_HEIGHT,
  },
  wheelContent: {
    paddingVertical: LIST_PADDING,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelText: {
    color: theme.text.tertiary,
    fontSize: 16,
    fontWeight: '600',
  },
  wheelTextSelected: {
    color: theme.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  wheelHighlight: {
    position: 'absolute',
    top: (LIST_HEIGHT - ITEM_HEIGHT) / 2,
    left: 10,
    right: 10,
    height: ITEM_HEIGHT,
    borderRadius: theme.radius.button,
    backgroundColor: theme.accent.primary + '1A',
    borderWidth: 1,
    borderColor: theme.accent.primary + '66',
  },
  doneButton: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.button,
    backgroundColor: theme.accent.primary,
  },
  doneText: {
    color: theme.background.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
