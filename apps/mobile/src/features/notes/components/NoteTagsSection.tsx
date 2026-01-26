import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface NoteTagsSectionProps {
  tags: string[];
  tagInput: string;
  onTagInputChange: (text: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export const NoteTagsSection: React.FC<NoteTagsSectionProps> = ({
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
}) => {
  return (
    <View style={styles.tagsSection}>
      <Text style={styles.sectionLabel}>Tags</Text>
      <View style={styles.tagsContainer}>
        {tags.map(tag => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagText}>#{tag}</Text>
            <TouchableOpacity
              onPress={() => onRemoveTag(tag)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.tagRemove}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TextInput
          style={styles.tagInput}
          placeholder="Add tags..."
          placeholderTextColor={theme.text.muted}
          value={tagInput}
          onChangeText={onTagInputChange}
          onSubmitEditing={onAddTag}
          returnKeyType="done"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tagsSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionLabel: {
    color: theme.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: theme.input.background,
    borderRadius: 12,
    padding: spacing.sm,
    minHeight: 44,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.accent.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    color: theme.accent.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  tagRemove: {
    color: theme.accent.primary,
    fontSize: 18,
    fontWeight: '300',
    marginLeft: spacing.xs,
  },
  tagInput: {
    flex: 1,
    color: theme.text.primary,
    fontSize: 14,
    minWidth: 100,
    paddingVertical: 4,
  },
});
