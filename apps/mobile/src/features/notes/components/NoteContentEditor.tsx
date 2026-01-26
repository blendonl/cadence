import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface NoteContentEditorProps {
  value: string;
  onChange: (text: string) => void;
}

export const NoteContentEditor: React.FC<NoteContentEditorProps> = ({
  value,
  onChange,
}) => {
  return (
    <View style={styles.editorContainer}>
      <TextInput
        style={styles.contentInput}
        placeholder="Start writing your note..."
        placeholderTextColor={theme.text.muted}
        value={value}
        onChangeText={onChange}
        multiline
        textAlignVertical="top"
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  editorContainer: {
    paddingHorizontal: spacing.lg,
    minHeight: 400,
  },
  contentInput: {
    color: theme.text.primary,
    fontSize: 17,
    lineHeight: 28,
    minHeight: 400,
  },
});
