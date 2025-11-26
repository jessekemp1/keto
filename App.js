import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import LogMetricsScreen from './src/screens/LogMetricsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import PhaseInfoScreen from './src/screens/PhaseInfoScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: '#6b7280',
            headerStyle: {
              backgroundColor: '#f9fafb',
            },
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'Keto Continuum' }}
          />
          <Tab.Screen 
            name="Log" 
            component={LogMetricsScreen}
            options={{ title: 'Log Metrics' }}
          />
          <Tab.Screen 
            name="Analytics" 
            component={AnalyticsScreen}
            options={{ title: 'Progress' }}
          />
          <Tab.Screen 
            name="Phase" 
            component={PhaseInfoScreen}
            options={{ title: 'Current Phase' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
