import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '@shared/components/Screen';
import theme from '@shared/theme/colors';

export const LoadingState: React.FC = () => {
  return (
    <Screen style={styles.container}>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.text.secondary,
  },
});
