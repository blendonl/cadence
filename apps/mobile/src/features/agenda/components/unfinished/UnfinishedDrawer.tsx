import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import AppIcon from '@shared/components/icons/AppIcon';
import { AgendaItemCard } from '../AgendaItemCard';
import { STAGGER_DELAY } from '@shared/utils/animations';

interface UnfinishedDrawerProps {
  isOpen: boolean;
  items: AgendaItemEnrichedDto[];
  onClose: () => void;
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onItemLongPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
}

export const UnfinishedDrawer: React.FC<UnfinishedDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onItemPress,
  onItemLongPress,
  onToggleComplete,
}) => {
  const { height: screenHeight } = useWindowDimensions();
  const maxHeight = screenHeight * 0.6;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.drawerOuter, { maxHeight }]} onStartShouldSetResponder={() => true}>
          <BlurView intensity={30} tint="dark" style={styles.blur}>
            <View style={styles.drawerInner}>
              <View style={styles.handle} />
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <AppIcon name="alert" size={20} color={theme.accent.warning} />
                  <Text style={styles.headerTitle}>Unfinished Tasks</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{items.length}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <AppIcon name="x" size={20} color={theme.text.secondary} />
                </TouchableOpacity>
              </View>
              {items.length === 0 ? (
                <View style={styles.emptyState}>
                  <AppIcon name="check" size={40} color={theme.accent.success} />
                  <Text style={styles.emptyTitle}>All caught up!</Text>
                  <Text style={styles.emptySubtitle}>No unfinished tasks remaining.</Text>
                </View>
              ) : (
                <ScrollView
                  style={{ maxHeight: maxHeight - 100 }}
                  contentContainerStyle={styles.contentContainer}
                  showsVerticalScrollIndicator={false}
                >
                  {items.map((item, index) => (
                    <Animated.View
                      key={item.id}
                      entering={FadeInDown.delay(index * STAGGER_DELAY).duration(300)}
                    >
                      <AgendaItemCard
                        item={item}
                        onPress={() => {
                          onClose();
                          onItemPress(item);
                        }}
                        onLongPress={() => {
                          onClose();
                          onItemLongPress(item);
                        }}
                        onToggleComplete={() => onToggleComplete(item)}
                      />
                    </Animated.View>
                  ))}
                </ScrollView>
              )}
            </View>
          </BlurView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawerOuter: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.glass.border,
  },
  blur: {
    flex: 1,
  },
  drawerInner: {
    flex: 1,
    backgroundColor: theme.glass.background,
    paddingBottom: spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border.secondary,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.glass.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
  },
  countBadge: {
    backgroundColor: 'rgba(242, 107, 107, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.status.error,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background.elevated,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  contentContainer: {
    padding: spacing.lg,
  },
});
