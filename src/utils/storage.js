import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import { getCurrentUser } from '../services/authService';
import * as FirestoreService from '../services/firestoreService';

const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  DAILY_METRICS: 'daily_metrics',
  USE_CLOUD_SYNC: 'use_cloud_sync',
};

/**
 * Check if cloud sync is enabled and user is logged in
 */
const shouldUseCloud = async () => {
  try {
    const user = getCurrentUser();
    if (!user) return false;

    const cloudSync = await AsyncStorage.getItem(STORAGE_KEYS.USE_CLOUD_SYNC);
    return cloudSync === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Enable or disable cloud sync
 */
export const setCloudSync = async (enabled) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USE_CLOUD_SYNC, enabled ? 'true' : 'false');

    // If enabling cloud sync, migrate local data to Firebase
    if (enabled) {
      await migrateLocalDataToCloud();
    }
  } catch (error) {
    console.error('Error setting cloud sync:', error);
  }
};

/**
 * Migrate local data to Firebase
 */
const migrateLocalDataToCloud = async () => {
  try {
    const user = getCurrentUser();
    if (!user) return;

    // Migrate profile
    const localProfile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (localProfile) {
      const profile = JSON.parse(localProfile);
      await FirestoreService.saveUserProfile(user.uid, profile);
    }

    // Migrate metrics
    const localMetrics = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_METRICS);
    if (localMetrics) {
      const metrics = JSON.parse(localMetrics);
      for (const metric of metrics) {
        await FirestoreService.saveDailyMetric(user.uid, metric);
      }
    }

    console.log('Successfully migrated local data to cloud');
  } catch (error) {
    console.error('Error migrating data to cloud:', error);
  }
};

// Default user profile
const DEFAULT_PROFILE = {
  startDate: format(new Date(), 'yyyy-MM-dd'),
  currentPhase: 1,
  phaseStartDate: format(new Date(), 'yyyy-MM-dd'),
  targetDrBozRatio: 80,
};

// Phase definitions
export const PHASES = {
  1: {
    name: 'Foundation Start',
    description: 'Eat every 2-4 hours, <20g total carbs',
    duration: 7,
    requirements: 'Keep carbs under 20g total. Eat when hungry.',
  },
  2: {
    name: 'Foundation Extended',
    description: 'Eat every 6-8 hours, <20g total carbs',
    duration: 7,
    requirements: 'Space meals 6-8 hours apart. Track ketones.',
  },
  3: {
    name: 'Keto-Adapted',
    description: 'Accidentally miss meals without hunger',
    duration: 7,
    requirements: 'Natural meal skipping. Sustained ketones >0.5',
  },
  4: {
    name: 'Two Meals (2MAD)',
    description: 'Intentional two meals per day',
    duration: 7,
    requirements: 'Two meals daily. 10-12 hour eating window.',
  },
  5: {
    name: '16:8 Fasting',
    description: 'Restrict calories to 8-hour window',
    duration: 14,
    requirements: '16 hour fast daily. Eating window: 8 hours.',
  },
  6: {
    name: 'Clean Morning',
    description: 'No calories/sweeteners before eating window',
    duration: 14,
    requirements: 'Water, black coffee, salt only outside window.',
  },
  7: {
    name: 'OMAD (23:1)',
    description: 'One meal per day',
    duration: 14,
    requirements: 'Single meal daily. Dr. Boz Ratio target: <100',
  },
  8: {
    name: 'Advanced OMAD',
    description: 'Meal during daylight, 12hr pre-sunrise fast',
    duration: 14,
    requirements: 'Meal between 11am-6pm. No food 12hrs before sunrise.',
  },
  9: {
    name: '36-Hour Fast',
    description: 'Extended fast for metabolic stress',
    duration: 7,
    requirements: 'Weekly 36hr fast. Water, salt, electrolytes only.',
  },
  10: {
    name: '48-Hour Fast',
    description: 'Deeper autophagy activation',
    duration: 7,
    requirements: 'Complete 48 hours without food. Monitor closely.',
  },
  11: {
    name: '72-Hour Fast',
    description: 'Maximum autophagy trigger',
    duration: 7,
    requirements: 'Full 72hr fast. Medical supervision recommended.',
  },
  12: {
    name: 'Autophagy Master',
    description: 'Regular 72hr fasting cycles',
    duration: null,
    requirements: 'Repeat 72hr fasts as needed. Maintenance phase.',
  },
};

export const getUserProfile = async () => {
  try {
    // Check if should use cloud storage
    if (await shouldUseCloud()) {
      const user = getCurrentUser();
      const result = await FirestoreService.getUserProfile(user.uid);

      if (result.success && result.profile) {
        // Cache to local storage
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(result.profile));
        return result.profile;
      }
    }

    // Fallback to local storage
    const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : DEFAULT_PROFILE;
  } catch (error) {
    console.error('Error loading profile:', error);
    return DEFAULT_PROFILE;
  }
};

export const saveUserProfile = async (profile) => {
  try {
    // Save to local storage (always)
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));

    // Also save to cloud if enabled
    if (await shouldUseCloud()) {
      const user = getCurrentUser();
      await FirestoreService.saveUserProfile(user.uid, profile);
    }
  } catch (error) {
    console.error('Error saving profile:', error);
  }
};

export const getDailyMetrics = async () => {
  try {
    // Check if should use cloud storage
    if (await shouldUseCloud()) {
      const user = getCurrentUser();
      const result = await FirestoreService.getAllMetrics(user.uid);

      if (result.success && result.metrics) {
        // Cache to local storage
        await AsyncStorage.setItem(STORAGE_KEYS.DAILY_METRICS, JSON.stringify(result.metrics));
        return result.metrics;
      }
    }

    // Fallback to local storage
    const metrics = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_METRICS);
    return metrics ? JSON.parse(metrics) : [];
  } catch (error) {
    console.error('Error loading metrics:', error);
    return [];
  }
};

export const saveDailyMetric = async (metric) => {
  try {
    const date = metric.date || format(new Date(), 'yyyy-MM-dd');
    const metricWithDate = { ...metric, date };

    // Save to local storage (always)
    const metrics = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_METRICS);
    const existingMetrics = metrics ? JSON.parse(metrics) : [];

    // Remove existing entry for this date
    const filtered = existingMetrics.filter(m => m.date !== date);

    // Add new entry
    const newMetrics = [...filtered, metricWithDate];

    // Sort by date descending
    newMetrics.sort((a, b) => new Date(b.date) - new Date(a.date));

    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_METRICS, JSON.stringify(newMetrics));

    // Also save to cloud if enabled
    if (await shouldUseCloud()) {
      const user = getCurrentUser();
      await FirestoreService.saveDailyMetric(user.uid, metricWithDate);
    }

    return newMetrics;
  } catch (error) {
    console.error('Error saving metric:', error);
    throw error;
  }
};

export const getRecentMetrics = async (days = 7) => {
  try {
    const metrics = await getDailyMetrics();
    const cutoffDate = subDays(new Date(), days);
    
    return metrics
      .filter(m => parseISO(m.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Error loading recent metrics:', error);
    return [];
  }
};

export const getTodayMetric = async () => {
  try {
    const metrics = await getDailyMetrics();
    const today = format(new Date(), 'yyyy-MM-dd');
    return metrics.find(m => m.date === today) || null;
  } catch (error) {
    console.error('Error loading today metric:', error);
    return null;
  }
};

export const checkPhaseAdvancement = async (profile) => {
  const phase = PHASES[profile.currentPhase];
  
  if (!phase.duration) {
    return profile; // Phase 12 has no duration limit
  }
  
  const daysInPhase = differenceInDays(
    new Date(),
    parseISO(profile.phaseStartDate)
  );
  
  if (daysInPhase >= phase.duration) {
    // Auto-advance to next phase
    const nextPhase = Math.min(profile.currentPhase + 1, 12);
    const updatedProfile = {
      ...profile,
      currentPhase: nextPhase,
      phaseStartDate: format(new Date(), 'yyyy-MM-dd'),
    };
    
    await saveUserProfile(updatedProfile);
    return updatedProfile;
  }
  
  return profile;
};

export const calculateDrBozRatio = (glucose, ketones) => {
  if (!glucose || !ketones) return null;
  if (ketones === 0) return 999; // Avoid division by zero
  return Math.round((glucose / ketones) * 10) / 10;
};

export const getRatioColor = (ratio) => {
  if (ratio === null) return '#6b7280';
  if (ratio < 40) return '#10b981'; // Green
  if (ratio < 80) return '#f59e0b'; // Yellow
  return '#ef4444'; // Red
};

export const getRatioStatus = (ratio) => {
  if (ratio === null) return 'No data';
  if (ratio < 40) return 'Excellent';
  if (ratio < 80) return 'Good';
  if (ratio < 100) return 'Fair';
  return 'Needs work';
};
