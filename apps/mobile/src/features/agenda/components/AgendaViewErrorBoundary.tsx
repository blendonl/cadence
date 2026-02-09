import React, { Component, ErrorInfo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import AppIcon from '@shared/components/icons/AppIcon';

interface AgendaViewErrorBoundaryProps {
  children: React.ReactNode;
  onRecover?: () => void;
}

interface AgendaViewErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AgendaViewErrorBoundary extends Component<
  AgendaViewErrorBoundaryProps,
  AgendaViewErrorBoundaryState
> {
  constructor(props: AgendaViewErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AgendaViewErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AgendaViewErrorBoundary caught:', error, errorInfo);
  }

  handleRecover = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRecover?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <AppIcon name="alert" size={40} color={theme.status.error} />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>This view encountered an error.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={this.handleRecover}>
            <AppIcon name="shuffle" size={16} color={theme.background.primary} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
    marginTop: spacing.md,
  },
  message: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.lg,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.accent.primary,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.background.primary,
  },
});
