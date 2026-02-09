import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@shared/theme/colors';
import GlassCard from '@shared/components/GlassCard';
import { Button } from '@shared/components/Button';

interface DetailNotesSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onSave: () => Promise<void>;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  originalNotes: string;
}

export const DetailNotesSection: React.FC<DetailNotesSectionProps> = ({
  notes,
  onNotesChange,
  onSave,
  isEditing,
  setIsEditing,
  originalNotes,
}) => {
  const handleCancel = () => {
    onNotesChange(originalNotes);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <GlassCard>
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={notes}
            onChangeText={onNotesChange}
            placeholder="Add notes..."
            placeholderTextColor={theme.text.muted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            autoFocus
          />
          <View style={styles.editActions}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Button title="Save" onPress={onSave} size="small" variant="primary" />
          </View>
        </View>
      </GlassCard>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => setIsEditing(true)}>
      <GlassCard>
        <View style={styles.viewContainer}>
          <Text style={styles.label}>Notes</Text>
          <Text style={notes ? styles.notesText : styles.placeholder}>
            {notes || 'Tap to add notes...'}
          </Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  viewContainer: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.text.primary,
  },
  placeholder: {
    fontSize: 14,
    color: theme.text.muted,
    fontStyle: 'italic',
  },
  editContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: theme.input.background,
    borderWidth: 1,
    borderColor: theme.input.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.text.primary,
    minHeight: 120,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.tertiary,
  },
});
