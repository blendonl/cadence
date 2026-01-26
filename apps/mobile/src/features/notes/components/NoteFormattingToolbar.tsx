import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface NoteFormattingToolbarProps {
  onInsertTemplate: (template: string) => void;
}

export const NoteFormattingToolbar: React.FC<NoteFormattingToolbarProps> = ({
  onInsertTemplate,
}) => {
  return (
    <View style={styles.toolbar}>
      <TouchableOpacity style={styles.toolButton} onPress={() => onInsertTemplate('\n## ')}>
        <Text style={styles.toolButtonText}>H</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toolButton} onPress={() => onInsertTemplate('\n- ')}>
        <Text style={styles.toolButtonText}>•</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toolButton} onPress={() => onInsertTemplate('\n- [ ] ')}>
        <Text style={styles.toolButtonText}>☐</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toolButton} onPress={() => onInsertTemplate('\n> ')}>
        <Text style={styles.toolButtonText}>"</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  toolButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: theme.glass.tint.neutral,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  toolButtonText: {
    color: theme.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});
