import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { theme, spacing } from '@shared/theme';
import { PlusIcon } from '@shared/components/icons/TabIcons';

export interface CreateProjectFABProps {
  onPress: () => void;
}

const CreateProjectFAB: React.FC<CreateProjectFABProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <PlusIcon size={24} focused color="#ffffff" />
    </TouchableOpacity>
  );
};

CreateProjectFAB.displayName = 'CreateProjectFAB';

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default React.memo(CreateProjectFAB);
