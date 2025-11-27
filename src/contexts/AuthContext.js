import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthChange, getCurrentUser, signOut as authSignOut } from '../services/authService';
import { setCloudSync } from '../utils/storage';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthChange(async (user) => {
      setUser(user);

      if (user) {
        // User is signed in, enable cloud sync
        await setCloudSync(true);
      } else {
        // User is signed out, disable cloud sync
        await setCloudSync(false);
      }

      if (initializing) {
        setInitializing(false);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [initializing]);

  const signOut = async () => {
    try {
      setLoading(true);
      await authSignOut();
      await setCloudSync(false);
      setUser(null);
      setLoading(false);
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    initializing,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
