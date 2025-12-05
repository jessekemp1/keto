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
import { useTheme } from '../contexts/ThemeContext';
import AuthScreen from './AuthScreen';
import { exportMetricsToCSV } from '../utils/storage';

export default function SettingsScreen() {
  const { user, signOut: contextSignOut, loading: authLoading } = useAuth();
  const { theme, themeName, changeTheme, availableThemes } = useTheme();
  const [showAuth, setShowAuth] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSignOut = async () => {
    // For web, use window.confirm instead of Alert.alert which may not work
    const confirmed = window.confirm(
      'Are you sure you want to sign out? Your data will remain on this device but won\'t sync to the cloud.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setSigningOut(true);
      const result = await contextSignOut();
      setSigningOut(false);

      if (result && result.success) {
        // Show success message
        window.alert('You have been signed out successfully.');
        // The AuthContext will update the UI automatically via onAuthChange
      } else {
        const errorMsg = result?.error || 'Failed to sign out. Please try again.';
        console.error('Sign out failed:', errorMsg);
        window.alert(`Error: ${errorMsg}`);
      }
    } catch (error) {
      setSigningOut(false);
      console.error('Sign out error:', error);
      window.alert('Failed to sign out. Please try again.');
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const result = await exportMetricsToCSV();
      setExporting(false);

      if (result.success) {
        // For web, trigger download
        if (typeof window !== 'undefined' && window.document) {
          const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', result.filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          Alert.alert(
            'Export Successful!',
            `Exported ${result.recordCount} records to ${result.filename}`,
            [{ text: 'OK' }]
          );
        } else {
          // For native, show the CSV content (user can copy)
          Alert.alert(
            'Export Ready',
            `Exported ${result.recordCount} records. CSV content copied to clipboard.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert('Export Failed', result.error || 'Failed to export data');
      }
    } catch (error) {
      setExporting(false);
      console.error('Export error:', error);
      Alert.alert('Export Failed', error.message || 'An error occurred while exporting data');
    }
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
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>
              Choose a theme that matches your style
            </Text>
          </View>
          {availableThemes.map((availableTheme) => (
            <TouchableOpacity
              key={availableTheme.name}
              style={[
                styles.themeOption,
                { 
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  shadowColor: theme.colors.shadow,
                },
                themeName === availableTheme.name && {
                  borderColor: theme.colors.accent,
                  borderWidth: 2,
                }
              ]}
              onPress={() => changeTheme(availableTheme.name)}
            >
              <View style={styles.themePreview}>
                <View style={[styles.themeColorBox, { backgroundColor: availableTheme.colors.background }]} />
                <View style={[styles.themeColorBox, { backgroundColor: availableTheme.colors.card }]} />
                <View style={[styles.themeColorBox, { backgroundColor: availableTheme.colors.accent }]} />
              </View>
              <View style={styles.themeInfo}>
                <Text style={[styles.themeName, { color: theme.colors.text }]}>
                  {availableTheme.name}
                </Text>
                {themeName === availableTheme.name && (
                  <Text style={[styles.themeSelected, { color: theme.colors.accent }]}>
                    Selected
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account</Text>

          {user ? (
            <>
              <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
                <View style={styles.accountInfo}>
                  <View style={[styles.avatarCircle, { backgroundColor: theme.colors.accent }]}>
                    <Text style={styles.avatarText}>
                      {user.displayName
                        ? user.displayName[0].toUpperCase()
                        : user.email[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.accountDetails}>
                    {user.displayName && (
                      <Text style={[styles.accountName, { color: theme.colors.text }]}>{user.displayName}</Text>
                    )}
                    <Text style={[styles.accountEmail, { color: theme.colors.textSecondary }]}>{user.email}</Text>
                    <View style={[styles.syncBadge, { backgroundColor: theme.colors.success + '20' }]}>
                      <Text style={[styles.syncBadgeText, { color: theme.colors.success }]}>☁️ Cloud Sync Enabled</Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.signOutButton, 
                  { 
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.error,
                  },
                  (authLoading || signingOut) && styles.buttonDisabled
                ]}
                onPress={handleSignOut}
                disabled={authLoading || signingOut}
              >
                {(authLoading || signingOut) ? (
                  <ActivityIndicator color={theme.colors.error} />
                ) : (
                  <Text style={[styles.signOutButtonText, { color: theme.colors.error }]}>Sign Out</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
                <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>
                  Sign in to sync your data across all devices and never lose your progress.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.signInButton, { backgroundColor: theme.colors.accent }]}
                onPress={() => setShowAuth(true)}
              >
                <Text style={styles.signInButtonText}>Sign In / Create Account</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Data Management</Text>
          <TouchableOpacity
            style={[
              styles.button, 
              styles.exportButton, 
              { 
                backgroundColor: theme.colors.accentBackground,
                borderColor: theme.colors.accent,
              },
              exporting && styles.buttonDisabled
            ]}
            onPress={handleExportData}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator color={theme.colors.accent} />
            ) : (
              <>
                <Text style={[styles.exportButtonText, { color: theme.colors.accent }]}>📥 Export Data to CSV</Text>
                <Text style={[styles.exportButtonSubtext, { color: theme.colors.textSecondary }]}>
                  Download all your metrics for analysis or backup
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Data Storage Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Data Storage</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.accentBackground, borderColor: theme.colors.accent + '40' }]}>
            {user ? (
              <>
                <Text style={[styles.infoTitle, { color: theme.colors.accent }]}>☁️ Cloud Storage Active</Text>
                <Text style={[styles.infoText, { color: theme.colors.accent }]}>
                  Your data is automatically backed up to Firebase and syncs across all devices where you're signed in.
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.infoTitle, { color: theme.colors.accent }]}>📱 Local Storage Only</Text>
                <Text style={[styles.infoText, { color: theme.colors.accent }]}>
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
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themePreview: {
    flexDirection: 'row',
    marginRight: 16,
    gap: 4,
  },
  themeColorBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeSelected: {
    fontSize: 12,
    fontWeight: '600',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  syncBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncBadgeText: {
    fontSize: 12,
    fontWeight: '600',
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
    // backgroundColor set dynamically
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  exportButton: {
    borderWidth: 2,
    marginBottom: 12,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  exportButtonSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  signOutButton: {
    borderWidth: 2,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
