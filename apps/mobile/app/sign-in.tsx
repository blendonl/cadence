import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { theme } from '@shared/theme';
import { useAuth } from '@core/auth/AuthContext';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePress = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      await signIn();
    } catch {
      setError('Sign-in failed. Please try again.');
      setIsSigningIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandingSection}>
        <Text style={styles.appName}>Cadence</Text>
        <Text style={styles.tagline}>Organize your flow</Text>
      </View>

      <View style={styles.signInSection}>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <TouchableOpacity
          style={[styles.googleButton, isSigningIn && styles.googleButtonDisabled]}
          onPress={handlePress}
          disabled={isSigningIn}
        >
          {isSigningIn ? (
            <ActivityIndicator size="small" color="#333" />
          ) : (
            <>
              <Image
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  brandingSection: {
    alignItems: 'center',
    marginBottom: 80,
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    color: theme.text.primary,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: theme.text.secondary,
    marginTop: 8,
  },
  signInSection: {
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    color: theme.accent.error,
    fontSize: 14,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    gap: 12,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
});
