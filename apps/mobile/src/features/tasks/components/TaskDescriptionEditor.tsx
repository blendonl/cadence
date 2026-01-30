import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface MarkdownTemplate {
  label: string;
  template: string;
}

interface TaskDescriptionEditorProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const MARKDOWN_TEMPLATES: MarkdownTemplate[] = [
  { label: 'H', template: '\n## ' },
  { label: '-', template: '\n- ' },
  { label: '[]', template: '\n- [ ] ' },
  { label: '"', template: '\n> ' },
];

export const TaskDescriptionEditor: React.FC<TaskDescriptionEditorProps> = ({
  value,
  onChangeText,
  placeholder = 'Description (optional)',
}) => {
  const insertTemplate = (template: string) => {
    onChangeText(value + template);
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        {MARKDOWN_TEMPLATES.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.toolButton}
            onPress={() => insertTemplate(item.template)}
          >
            <Text style={styles.toolButtonText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.editorContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.text.muted}
          value={value}
          onChangeText={onChangeText}
          multiline
          textAlignVertical="top"
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  toolbar: {
    flexDirection: 'row',
    paddingBottom: spacing.md,
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
  editorContainer: {
    minHeight: 200,
  },
  input: {
    color: theme.text.primary,
    fontSize: 17,
    lineHeight: 26,
    minHeight: 200,
  },
});
