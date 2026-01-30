import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '@shared/theme';
import AppIcon from '@shared/components/icons/AppIcon';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'number-pad' | 'numbers-and-punctuation';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
}) => {
  return (
    <View style={styles.formSection}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        placeholderTextColor={theme.text.tertiary}
      />
    </View>
  );
};

interface ToggleFieldProps {
  label: string;
  value: boolean;
  onToggle: () => void;
}

export const ToggleField: React.FC<ToggleFieldProps> = ({ label, value, onToggle }) => {
  return (
    <TouchableOpacity style={styles.toggleContainer} onPress={onToggle}>
      <View style={styles.toggleContent}>
        <AppIcon
          name={value ? 'check-square' : 'square'}
          size={20}
          color={value ? theme.primary : theme.text.secondary}
        />
        <Text style={styles.toggleText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  formSection: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.input.background,
    borderWidth: 1,
    borderColor: theme.input.border,
    borderRadius: theme.radius.input,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.text.primary,
  },
  toggleContainer: {
    marginBottom: theme.spacing.md,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  toggleText: {
    fontSize: 16,
    color: theme.text.primary,
  },
});
