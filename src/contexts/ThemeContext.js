import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUserTheme, saveUserTheme, getCustomThemeColors, saveCustomThemeColors } from '../utils/storage';
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
  'Terminal Gray': {
    name: 'Terminal Gray',
    colors: {
      background: '#1a1a1a',
      card: '#2a2a2a',
      text: '#cccccc',
      textSecondary: '#888888',
      accent: '#888888',
      accentBackground: '#1a1a1a',
      border: '#3a3a3a',
      shadow: '#000',
      success: '#888888',
      warning: '#aaaaaa',
      error: '#cc6666',
    },
  },
  'Naval Console': {
    name: 'Naval Console',
    colors: {
      background: '#0a1a2a',
      card: '#1a2a3a',
      text: '#aaccff',
      textSecondary: '#6a8aaa',
      accent: '#4a6a8a',
      accentBackground: '#0a1a2a',
      border: '#2a3a4a',
      shadow: '#000',
      success: '#4a8a6a',
      warning: '#8a8a4a',
      error: '#8a4a4a',
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
  const [customTheme, setCustomTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserTheme = async () => {
      if (authInitializing) return;

      setLoading(true);
      const storedThemeName = await getUserTheme();
      
      if (storedThemeName === 'Custom') {
        const customColors = await getCustomThemeColors();
        if (customColors) {
          setThemeName('Custom');
          setCustomTheme({ name: 'Custom', colors: customColors });
          setTheme({ name: 'Custom', colors: customColors });
        } else {
          // Fallback if custom theme doesn't exist
          setThemeName('Modern Minimal');
          setTheme(themes['Modern Minimal']);
        }
      } else {
        const selectedTheme = themes[storedThemeName] || themes['Modern Minimal'];
        setThemeName(selectedTheme.name);
        setTheme(selectedTheme);
      }
      setLoading(false);
    };
    loadUserTheme();
  }, [user, authInitializing]);

  const changeTheme = async (newThemeName) => {
    if (themes[newThemeName]) {
      setThemeName(newThemeName);
      setTheme(themes[newThemeName]);
      setCustomTheme(null);
      await saveUserTheme(newThemeName);
    } else if (newThemeName === 'Custom' && customTheme) {
      setThemeName('Custom');
      setTheme(customTheme);
      await saveUserTheme('Custom');
    } else {
      console.warn(`Theme "${newThemeName}" not found.`);
    }
  };

  const updateCustomTheme = async (colors) => {
    const customThemeObj = { name: 'Custom', colors };
    setCustomTheme(customThemeObj);
    setThemeName('Custom');
    setTheme(customThemeObj);
    await saveCustomThemeColors(colors);
    await saveUserTheme('Custom');
  };

  const getAvailableThemes = () => {
    const baseThemes = Object.values(themes);
    if (customTheme) {
      return [...baseThemes, customTheme];
    }
    return baseThemes;
  };

  const value = {
    theme,
    themeName,
    changeTheme,
    availableThemes: getAvailableThemes(),
    updateCustomTheme,
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
