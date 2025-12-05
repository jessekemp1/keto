import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text, Modal, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import LogMetricsScreen from './src/screens/LogMetricsScreen';
import PhaseInfoScreen from './src/screens/PhaseInfoScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

function TopNavigationBar({ navigation, currentRoute, theme }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems = [
    { name: 'Home', route: 'Home', title: 'Continuum' },
    { name: 'Log', route: 'Log', title: 'Log' },
    { name: 'Phase', route: 'Phase', title: 'Phase' },
    { name: 'Settings', route: 'Settings', title: 'Settings' },
  ];

  const currentTitle = menuItems.find(item => item.route === currentRoute)?.title || 'Keto Tracker';

  return (
    <SafeAreaView style={[styles.topBar, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
      >
        <Text style={[styles.menuIcon, { color: theme.colors.text }]}>☰</Text>
      </TouchableOpacity>
      <Text style={[styles.topBarTitle, { color: theme.colors.text }]}>{currentTitle}</Text>
      <View style={styles.topBarSpacer} />
      
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={[
                  styles.menuItem,
                  { borderBottomColor: theme.colors.border },
                  currentRoute === item.route && { backgroundColor: theme.colors.accentBackground }
                ]}
                onPress={() => {
                  navigation.navigate(item.route);
                  setMenuVisible(false);
                }}
              >
                <Text style={[
                  styles.menuItemText,
                  { color: theme.colors.text },
                  currentRoute === item.route && { color: theme.colors.accent, fontWeight: '700' }
                ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function AppContent() {
  const { user, loading, initializing } = useAuth();
  const { theme, loading: themeLoading } = useTheme();

  // Show loading spinner while checking auth state or loading theme
  if (loading || initializing || themeLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
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
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Stack.Navigator
          screenOptions={{
            header: ({ navigation, route }) => {
              return <TopNavigationBar navigation={navigation} currentRoute={route.name} theme={theme} />;
            },
            headerShown: true,
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            name="Log"
            component={LogMetricsScreen}
          />
          <Stack.Screen
            name="Phase"
            component={PhaseInfoScreen}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
          />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <StatusBar style="dark" />
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    height: 56,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  topBarSpacer: {
    width: 40, // Balance the menu button width
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 56,
  },
  menuContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
