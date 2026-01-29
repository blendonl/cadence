import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PrimaryButton } from '@shared/components/Button';
import theme from '@shared/theme';
import AppIcon from '@shared/components/icons/AppIcon';

interface Props {
  children: ReactNode;
  onReset?: () => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class BoardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    console.error('BoardErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <AppIcon name="bug" size={64} color={theme.colors.error} />
          </View>

          <Text style={styles.title}>Something Went Wrong</Text>
          <Text style={styles.message}>
            An unexpected error occurred while loading the board. Please try again.
          </Text>

          <PrimaryButton
            title="Reload Board"
            onPress={this.handleReset}
            style={styles.resetButton}
          />

          {__DEV__ && this.state.error && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Error Details:</Text>
              <Text style={styles.debugText}>
                {this.state.error.toString()}
              </Text>
              {this.state.errorInfo && (
                <>
                  <Text style={styles.debugTitle}>Component Stack:</Text>
                  <Text style={styles.debugText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                </>
              )}
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
    maxWidth: 300,
  },
  resetButton: {
    minWidth: 160,
  },
  debugContainer: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    maxWidth: '100%',
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.error,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  debugText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
});

export default BoardErrorBoundary;
