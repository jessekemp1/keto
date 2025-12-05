import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUserTheme, saveUserTheme } from '../utils/storage';
import { useAuth } from './AuthContext';

const ThemeContext = createContext({});

const themes = {
  'Modern Minimal': {
    name: 'Modern Minimal',
    colors: {
      background: '#fafafa',
      card: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      accent: '#2563eb',
      accentBackground: '#eff6ff',
      border: '#f3f4f6',
      shadow: '#000',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
  'Military Monochrome': {
    name: 'Military Monochrome',
    colors: {
      background: '#1a1a1a',
      card: '#2a2a2a',
      text: '#e0e0e0',
      textSecondary: '#a0a0a0',
      accent: '#00ff00',
      accentBackground: '#003300',
      border: '#3a3a3a',
      shadow: '#000',
      success: '#00cc00',
      warning: '#ffcc00',
      error: '#ff0000',
    },
  },
  'Dark Modern Sleek': {
    name: 'Dark Modern Sleek',
    colors: {
      background: '#0a0a0a',
      card: '#1a1a1a',
      text: '#f0f0f0',
      textSecondary: '#b0b0b0',
      accent: '#00bcd4',
      accentBackground: '#002b36',
      border: '#2a2a2a',
      shadow: '#000',
      success: '#4caf50',
      warning: '#ffc107',
      error: '#f44336',
    },
  },
};

export function ThemeProvider({ children }) {
  const { user, initializing: authInitializing } = useAuth();
  const [themeName, setThemeName] = useState('Modern Minimal');
  const [theme, setTheme] = useState(themes['Modern Minimal']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserTheme = async () => {
      if (authInitializing) return;

      setLoading(true);
      const storedThemeName = await getUserTheme();
      const selectedTheme = themes[storedThemeName] || themes['Modern Minimal'];
      setThemeName(selectedTheme.name);
      setTheme(selectedTheme);
      setLoading(false);
    };
    loadUserTheme();
  }, [user, authInitializing]);

  const changeTheme = async (newThemeName) => {
    if (themes[newThemeName]) {
      setThemeName(newThemeName);
      setTheme(themes[newThemeName]);
      await saveUserTheme(newThemeName);
    } else {
      console.warn(`Theme "${newThemeName}" not found.`);
    }
  };

  const value = {
    theme,
    themeName,
    changeTheme,
    availableThemes: Object.values(themes),
    loading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
