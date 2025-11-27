import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { signIn, signUp } from '../services/authService';
import { setCloudSync } from '../utils/storage';

export default function AuthScreen({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      // Enable cloud sync
      await setCloudSync(true);

      Alert.alert(
        'Welcome back!',
        'Your data will now sync across all your devices.',
        [{ text: 'OK', onPress: onAuthSuccess }]
      );
    } else {
      Alert.alert('Sign In Failed', result.error);
    }
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    const result = await signUp(email, password, displayName);
    setLoading(false);

    if (result.success) {
      // Enable cloud sync
      await setCloudSync(true);

      Alert.alert(
        'Account Created!',
        'Your account has been created successfully. Your data will sync across devices.',
        [{ text: 'Get Started', onPress: onAuthSuccess }]
      );
    } else {
      Alert.alert('Sign Up Failed', result.error);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Continue without account?',
      'Your data will only be saved on this device. You can create an account later to sync across devices.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: onAuthSuccess,
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Keto Tracker</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </Text>
      </View>

      <View style={styles.form}>
        {isSignUp && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name (optional)</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor="#9ca3af"
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {isSignUp && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={isSignUp ? handleSignUp : handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setIsSignUp(!isSignUp)}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Why create an account?</Text>
          <Text style={styles.benefitItem}>📱 Sync across all devices</Text>
          <Text style={styles.benefitItem}>☁️ Automatic cloud backup</Text>
          <Text style={styles.benefitItem}>🔒 Secure and private</Text>
          <Text style={styles.benefitItem}>📊 Access from anywhere</Text>
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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginVertical: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  form: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  skipButtonText: {
    color: '#6b7280',
    fontSize: 14,
  },
  benefitsCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 20,
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 12,
  },
  benefitItem: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 8,
    lineHeight: 20,
  },
});
