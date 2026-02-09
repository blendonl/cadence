import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '@shared/theme/colors';

export const DetailLoadingSkeleton: React.FC = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.heroSection}>
        <View style={styles.iconRow}>
          <View style={styles.typeIcon} />
          <View style={styles.typeBadge} />
        </View>
        <View style={styles.titleBlock} />
        <View style={styles.descBlock} />
      </View>

      <View style={styles.scheduleBar}>
        <View style={styles.schedulePill} />
        <View style={styles.schedulePill} />
        <View style={styles.schedulePill} />
      </View>

      <View style={styles.chipRow}>
        <View style={styles.chip} />
        <View style={styles.chip} />
      </View>

      <View style={styles.notesBlock}>
        <View style={styles.notesLine} />
        <View style={styles.notesLineShort} />
      </View>

      <View style={styles.actionRow}>
        <View style={styles.actionButton} />
      </View>
      <View style={styles.actionRowSecondary}>
        <View style={styles.actionButtonHalf} />
        <View style={styles.actionButtonHalf} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  heroSection: {
    gap: 12,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.background.elevated,
  },
  typeBadge: {
    width: 60,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.background.elevated,
  },
  titleBlock: {
    width: '75%',
    height: 28,
    borderRadius: 6,
    backgroundColor: theme.background.elevated,
  },
  descBlock: {
    width: '90%',
    height: 16,
    borderRadius: 4,
    backgroundColor: theme.background.elevated,
  },
  scheduleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.background.elevated,
    borderRadius: 12,
    padding: 14,
  },
  schedulePill: {
    width: 80,
    height: 14,
    borderRadius: 4,
    backgroundColor: theme.background.elevatedHigh,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    width: 90,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.background.elevated,
  },
  notesBlock: {
    backgroundColor: theme.background.elevated,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  notesLine: {
    width: '100%',
    height: 14,
    borderRadius: 4,
    backgroundColor: theme.background.elevatedHigh,
  },
  notesLineShort: {
    width: '60%',
    height: 14,
    borderRadius: 4,
    backgroundColor: theme.background.elevatedHigh,
  },
  actionRow: {
    marginTop: 8,
  },
  actionButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: theme.background.elevated,
  },
  actionRowSecondary: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtonHalf: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: theme.background.elevated,
  },
});
