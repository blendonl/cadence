import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Screen } from '@shared/components/Screen';
import { useAuth } from '@core/auth/AuthContext';
import theme from '@shared/theme/colors';

const APP_VERSION = '2.0.0';

function UserInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.initialsContainer}>
      <Text style={styles.initialsText}>{initials}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  return (
    <Screen scrollable hasTabBar edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {user && (
        <View style={styles.profileCard}>
          {user.image ? (
            <Image source={{ uri: user.image }} style={styles.avatar} />
          ) : (
            <UserInitials name={user.name} />
          )}
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
          <Text style={[styles.settingLabel, styles.dangerText]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>{APP_VERSION}</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Platform</Text>
          <Text style={styles.settingValue}>
            {Platform.OS === 'ios' ? 'iOS' : 'Android'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Cadence</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  initialsContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  initialsText: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text.primary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  section: {
    marginTop: 20,
    backgroundColor: theme.background.elevated,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.border.primary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.tertiary,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: theme.background.secondary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
    minHeight: 50,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.text.primary,
  },
  settingValue: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  dangerText: {
    color: theme.accent.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 50,
  },
  footerText: {
    fontSize: 13,
    color: theme.text.muted,
  },
});
