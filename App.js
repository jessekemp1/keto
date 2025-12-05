import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import LogMetricsScreen from './src/screens/LogMetricsScreen';
import PhaseInfoScreen from './src/screens/PhaseInfoScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { user, loading, initializing } = useAuth();

  // Show loading spinner while checking auth state
  if (loading || initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Show auth screen if not authenticated
  if (!user) {
    return (
      <AuthScreen
        onAuthSuccess={() => {
          // Auth state will update automatically via AuthContext
          console.log('User authenticated successfully');
        }}
      />
    );
  }

  // Show main app if authenticated
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#f3f4f6',
            paddingTop: 8,
            paddingBottom: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: '#f3f4f6',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
            color: '#111827',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Continuum' }}
        />
        <Tab.Screen
          name="Log"
          component={LogMetricsScreen}
          options={{ title: 'Log' }}
        />
        <Tab.Screen
          name="Phase"
          component={PhaseInfoScreen}
          options={{ title: 'Phase' }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
});
