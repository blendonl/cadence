import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

export const TaskParentPickerEmpty: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No tasks available</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: theme.text.secondary,
  },
});
