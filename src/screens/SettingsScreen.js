import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AuthScreen from './AuthScreen';

export default function SettingsScreen() {
  const { user, signOut, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data will remain on this device but won\'t sync to the cloud.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            Alert.alert('Signed Out', 'You have been signed out successfully.');
          },
        },
      ]
    );
  };

  if (showAuth) {
    return (
      <AuthScreen
        onAuthSuccess={() => {
          setShowAuth(false);
          Alert.alert('Success!', 'You are now signed in. Your data will sync across devices.');
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          {user ? (
            <>
              <View style={styles.card}>
                <View style={styles.accountInfo}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {user.displayName
                        ? user.displayName[0].toUpperCase()
                        : user.email[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.accountDetails}>
                    {user.displayName && (
                      <Text style={styles.accountName}>{user.displayName}</Text>
                    )}
                    <Text style={styles.accountEmail}>{user.email}</Text>
                    <View style={styles.syncBadge}>
                      <Text style={styles.syncBadgeText}>☁️ Cloud Sync Enabled</Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.signOutButton, loading && styles.buttonDisabled]}
                onPress={handleSignOut}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ef4444" />
                ) : (
                  <Text style={styles.signOutButtonText}>Sign Out</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.cardText}>
                  Sign in to sync your data across all devices and never lose your progress.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.signInButton]}
                onPress={() => setShowAuth(true)}
              >
                <Text style={styles.signInButtonText}>Sign In / Create Account</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <Text style={styles.appTitle}>Keto Tracker</Text>
            <Text style={styles.appDescription}>
              Track your ketogenic journey using Dr. Boz's 12-phase continuum.
              Monitor glucose, ketones, and your Dr. Boz Ratio to optimize metabolic health.
            </Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Data Storage Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage</Text>
          <View style={styles.infoCard}>
            {user ? (
              <>
                <Text style={styles.infoTitle}>☁️ Cloud Storage Active</Text>
                <Text style={styles.infoText}>
                  Your data is automatically backed up to Firebase and syncs across all devices where you're signed in.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.infoTitle}>📱 Local Storage Only</Text>
                <Text style={styles.infoText}>
                  Your data is currently only saved on this device. Sign in to enable cloud backup and sync.
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  syncBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInButton: {
    backgroundColor: '#2563eb',
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  signOutButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  signOutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  appVersion: {
    fontSize: 12,
    color: '#9ca3af',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});
