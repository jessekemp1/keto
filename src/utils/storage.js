import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import { getCurrentUser } from '../services/authService';
import * as FirestoreService from '../services/firestoreService';

const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  DAILY_METRICS: 'daily_metrics',
  USE_CLOUD_SYNC: 'use_cloud_sync',
  HAS_MIGRATED_TO_CLOUD: 'has_migrated_to_cloud',
  USER_THEME: 'user_theme',
  CUSTOM_THEME_COLORS: 'custom_theme_colors',
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
 * Trigger migration manually (useful for testing or manual sync)
 */
export const triggerDataMigration = async () => {
  return await migrateLocalDataToCloud();
};

/**
 * Check if data has already been migrated to cloud for current user
 */
const hasMigratedToCloud = async () => {
  try {
    const user = getCurrentUser();
    if (!user) return false;
    
    const migrationKey = `${STORAGE_KEYS.HAS_MIGRATED_TO_CLOUD}_${user.uid}`;
    const migrated = await AsyncStorage.getItem(migrationKey);
    return migrated === 'true';
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};

/**
 * Mark data as migrated for current user
 */
const setMigratedToCloud = async () => {
  try {
    const user = getCurrentUser();
    if (!user) return;
    
    const migrationKey = `${STORAGE_KEYS.HAS_MIGRATED_TO_CLOUD}_${user.uid}`;
    await AsyncStorage.setItem(migrationKey, 'true');
  } catch (error) {
    console.error('Error setting migration status:', error);
  }
};

/**
 * Migrate local data to Firebase
 */
const migrateLocalDataToCloud = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user signed in, skipping migration');
      return;
    }

    // Check if already migrated
    if (await hasMigratedToCloud()) {
      console.log('Data already migrated to cloud for this user');
      return;
    }

    console.log('Starting migration of local data to cloud...');

    // Migrate profile
    const localProfile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (localProfile) {
      const profile = JSON.parse(localProfile);
      await FirestoreService.saveUserProfile(user.uid, profile);
      console.log('✅ Profile migrated to cloud');
    }

    // Migrate metrics
    const localMetrics = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_METRICS);
    if (localMetrics) {
      const metrics = JSON.parse(localMetrics);
      let migratedCount = 0;
      for (const metric of metrics) {
        await FirestoreService.saveDailyMetric(user.uid, metric);
        migratedCount++;
      }
      console.log(`✅ Migrated ${migratedCount} metrics to cloud`);
    }

    // Mark as migrated
    await setMigratedToCloud();
    console.log('✅ Migration complete - local data synced to cloud');
  } catch (error) {
    console.error('❌ Error migrating data to cloud:', error);
    // Don't throw - migration failure shouldn't block app usage
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
      
      // Try to load from cloud first
      const result = await FirestoreService.getAllMetrics(user.uid);

      if (result.success && result.metrics && result.metrics.length > 0) {
        // Cloud has data - cache to local and return
        await AsyncStorage.setItem(STORAGE_KEYS.DAILY_METRICS, JSON.stringify(result.metrics));
        return result.metrics;
      }

      // Cloud is empty - check if we need to migrate local data
      if (!(await hasMigratedToCloud())) {
        const localMetrics = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_METRICS);
        if (localMetrics) {
          const localData = JSON.parse(localMetrics);
          if (localData.length > 0) {
            // Local data exists but cloud is empty - migrate it
            console.log('🔄 Cloud is empty but local data exists - migrating...');
            await migrateLocalDataToCloud();
            // After migration, reload from cloud
            const migratedResult = await FirestoreService.getAllMetrics(user.uid);
            if (migratedResult.success && migratedResult.metrics) {
              await AsyncStorage.setItem(STORAGE_KEYS.DAILY_METRICS, JSON.stringify(migratedResult.metrics));
              return migratedResult.metrics;
            }
          }
        }
      }

      // Cloud is empty and no local data (or already migrated) - return empty
      return [];
    }

    // Not using cloud - fallback to local storage
    const metrics = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_METRICS);
    return metrics ? JSON.parse(metrics) : [];
  } catch (error) {
    console.error('Error loading metrics:', error);
    // Fallback to local on error
    try {
      const metrics = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_METRICS);
      return metrics ? JSON.parse(metrics) : [];
    } catch (fallbackError) {
      console.error('Error loading from local fallback:', fallbackError);
      return [];
    }
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

    // Save to cloud first if enabled (cloud is source of truth)
    if (await shouldUseCloud()) {
      try {
        const user = getCurrentUser();
        await FirestoreService.saveDailyMetric(user.uid, metricWithDate);
        console.log('✅ Metric saved to cloud:', date);
        
        // Then cache to local storage for offline access
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.DAILY_METRICS, JSON.stringify(newMetrics));
          console.log('✅ Metric cached to local storage:', date);
        } catch (cacheError) {
          console.warn('⚠️ Failed to cache to local (cloud save succeeded):', cacheError);
          // Don't throw - cloud save succeeded, local cache is optional
        }
      } catch (cloudError) {
        console.warn('⚠️ Failed to save to cloud, falling back to local:', cloudError);
        // Fallback to local storage if cloud fails
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.DAILY_METRICS, JSON.stringify(newMetrics));
          console.log('✅ Metric saved to local storage (cloud unavailable):', date);
        } catch (storageError) {
          console.error('❌ Failed to save to local storage:', storageError);
          // Check if it's a quota error
          if (storageError.message && storageError.message.includes('quota')) {
            throw new Error('Storage quota exceeded. Please clear some browser data or sign in for cloud sync.');
          }
          throw storageError;
        }
      }
    } else {
      // Not using cloud - save to local storage only
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.DAILY_METRICS, JSON.stringify(newMetrics));
        console.log('✅ Metric saved to local storage:', date);
      } catch (storageError) {
        console.error('❌ Failed to save to local storage:', storageError);
        // Check if it's a quota error
        if (storageError.message && storageError.message.includes('quota')) {
          throw new Error('Storage quota exceeded. Please clear some browser data or sign in for cloud sync.');
        }
        throw storageError;
      }
      console.log('ℹ️ Cloud sync not enabled - data saved locally only');
    }

    return newMetrics;
  } catch (error) {
    console.error('❌ Error saving metric:', error);
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

/**
 * Export all metrics to CSV format
 */
export const exportMetricsToCSV = async () => {
  try {
    const metrics = await getDailyMetrics();
    const profile = await getUserProfile();

    if (metrics.length === 0) {
      return {
        success: false,
        error: 'No data to export',
      };
    }

    // Sort by date ascending
    const sortedMetrics = [...metrics].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Create CSV header
    const headers = [
      'Date',
      'Glucose (mmol/L)',
      'Ketones (mmol/L)',
      'Dr. Boz Ratio',
      'Status',
      'Weight (kg)',
      'Energy (1-10)',
      'Clarity (1-10)',
      'Phase',
    ];

    // Create CSV rows
    const rows = sortedMetrics.map((metric) => {
      const date = format(parseISO(metric.date), 'yyyy-MM-dd');
      const status = getRatioStatus(metric.drBozRatio);
      const phase = profile?.currentPhase || 'N/A';
      
      return [
        date,
        metric.glucose?.toString() || '',
        metric.ketones?.toString() || '',
        metric.drBozRatio?.toString() || '',
        status,
        metric.weight?.toString() || '',
        metric.energy?.toString() || '',
        metric.clarity?.toString() || '',
        phase.toString(),
      ];
    });

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Add BOM for Excel compatibility
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    return {
      success: true,
      csv: csvWithBOM,
      filename: `keto-tracker-export-${format(new Date(), 'yyyy-MM-dd')}.csv`,
      recordCount: metrics.length,
    };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return {
      success: false,
      error: error.message || 'Failed to export data',
    };
  }
};

/**
 * Generate sample historical data for the past 14 days
 * Shows realistic progression from higher ratios to lower (better) ratios
 */
export const generateSampleData = async () => {
  try {
    const existingMetrics = await getDailyMetrics();
    
    // Don't overwrite if there's already substantial data
    if (existingMetrics.length >= 10) {
      return { success: false, message: 'You already have enough data. Clear existing data first if you want to regenerate.' };
    }

    const sampleMetrics = [];
    const today = new Date();
    
    // Generate 14 days of sample data showing improvement over time
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Skip today if it already has data
      if (i === 0 && existingMetrics.some(m => m.date === dateStr)) {
        continue;
      }
      
      // Progressive improvement: start higher (worse), end lower (better)
      // Day 0-3: High ratios (100-120) - not in ketosis yet
      // Day 4-7: Medium ratios (70-90) - entering ketosis
      // Day 8-11: Good ratios (50-70) - therapeutic ketosis
      // Day 12-13: Excellent ratios (30-50) - deep ketosis
      
      let targetRatio;
      if (i >= 10) {
        targetRatio = 100 + Math.random() * 20; // 100-120
      } else if (i >= 6) {
        targetRatio = 70 + Math.random() * 20; // 70-90
      } else if (i >= 2) {
        targetRatio = 50 + Math.random() * 20; // 50-70
      } else {
        targetRatio = 30 + Math.random() * 20; // 30-50
      }
      
      // Generate realistic glucose and ketone values that produce the target ratio
      // Typical glucose: 4.0-5.5 mmol/L for keto
      // Typical ketones: 0.5-3.0 mmol/L for therapeutic ketosis
      const glucose = 4.0 + Math.random() * 1.5; // 4.0-5.5
      const ketones = glucose / targetRatio;
      
      // Ensure ketones are in realistic range (0.3-3.5)
      let finalKetones = ketones;
      if (ketones < 0.3) {
        finalKetones = 0.3 + Math.random() * 0.2;
      } else if (ketones > 3.5) {
        finalKetones = 2.5 + Math.random() * 1.0;
      }
      
      const finalRatio = calculateDrBozRatio(glucose, finalKetones);
      
      sampleMetrics.push({
        date: dateStr,
        glucose: Math.round(glucose * 10) / 10,
        ketones: Math.round(finalKetones * 10) / 10,
        drBozRatio: finalRatio,
        weight: i % 3 === 0 ? Math.round((180 - i * 0.2) * 10) / 10 : null, // Occasional weight entries
        energy: i % 2 === 0 ? Math.floor(5 + (13 - i) * 0.3) : null, // Improving energy
        clarity: i % 2 === 0 ? Math.floor(6 + (13 - i) * 0.25) : null, // Improving clarity
      });
    }
    
    // Merge with existing metrics (don't overwrite existing dates)
    const existingDates = new Set(existingMetrics.map(m => m.date));
    const newMetrics = sampleMetrics.filter(m => !existingDates.has(m.date));
    const allMetrics = [...existingMetrics, ...newMetrics];
    
    // Sort by date descending
    allMetrics.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Save to storage
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_METRICS, JSON.stringify(allMetrics));
    
    // Also save to cloud if enabled
    if (await shouldUseCloud()) {
      const user = getCurrentUser();
      for (const metric of newMetrics) {
        await FirestoreService.saveDailyMetric(user.uid, metric);
      }
    }
    
    return { success: true, message: `Generated ${newMetrics.length} days of sample data!`, count: newMetrics.length };
  } catch (error) {
    console.error('Error generating sample data:', error);
    return { success: false, message: 'Failed to generate sample data. Please try again.' };
  }
};

/**
 * Get user's selected theme name
 */
export const getUserTheme = async () => {
  try {
    const theme = await AsyncStorage.getItem(STORAGE_KEYS.USER_THEME);
    return theme || 'Modern Minimal';
  } catch (error) {
    console.error('Error loading user theme:', error);
    return 'Modern Minimal';
  }
};

/**
 * Save user's selected theme name
 */
export const saveUserTheme = async (themeName) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_THEME, themeName);
  } catch (error) {
    console.error('Error saving user theme:', error);
  }
};

/**
 * Get custom theme colors
 */
export const getCustomThemeColors = async () => {
  try {
    const colors = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_THEME_COLORS);
    return colors ? JSON.parse(colors) : null;
  } catch (error) {
    console.error('Error loading custom theme colors:', error);
    return null;
  }
};

/**
 * Save custom theme colors
 */
export const saveCustomThemeColors = async (colors) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_THEME_COLORS, JSON.stringify(colors));
  } catch (error) {
    console.error('Error saving custom theme colors:', error);
  }
};
