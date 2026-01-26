import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface NoteTitleInputProps {
  value: string;
  onChange: (text: string) => void;
  autoFocus?: boolean;
}

export const NoteTitleInput: React.FC<NoteTitleInputProps> = ({
  value,
  onChange,
  autoFocus = false,
}) => {
  return (
    <View style={styles.titleContainer}>
      <TextInput
        style={styles.titleInput}
        placeholder="Untitled note"
        placeholderTextColor={theme.text.muted}
        value={value}
        onChangeText={onChange}
        autoFocus={autoFocus}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  titleInput: {
    color: theme.text.primary,
    fontSize: 28,
    fontWeight: '700',
  },
});
