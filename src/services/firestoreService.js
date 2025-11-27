import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Save or update user profile
 */
export const saveUserProfile = async (userId, profile) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving profile:', error);
    return {
      success: false,
      error: 'Failed to save profile',
    };
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return {
        success: true,
        profile: userSnap.data(),
      };
    } else {
      return {
        success: false,
        error: 'Profile not found',
      };
    }
  } catch (error) {
    console.error('Error getting profile:', error);
    return {
      success: false,
      error: 'Failed to load profile',
    };
  }
};

/**
 * Save daily metric
 */
export const saveDailyMetric = async (userId, metric) => {
  try {
    const metricRef = doc(db, 'users', userId, 'metrics', metric.date);
    await setDoc(metricRef, {
      ...metric,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving metric:', error);
    return {
      success: false,
      error: 'Failed to save metric',
    };
  }
};

/**
 * Get all metrics for a user
 */
export const getAllMetrics = async (userId) => {
  try {
    const metricsRef = collection(db, 'users', userId, 'metrics');
    const q = query(metricsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    const metrics = [];
    querySnapshot.forEach((doc) => {
      metrics.push(doc.data());
    });

    return {
      success: true,
      metrics,
    };
  } catch (error) {
    console.error('Error getting metrics:', error);
    return {
      success: false,
      error: 'Failed to load metrics',
      metrics: [],
    };
  }
};

/**
 * Get metric for a specific date
 */
export const getMetricByDate = async (userId, date) => {
  try {
    const metricRef = doc(db, 'users', userId, 'metrics', date);
    const metricSnap = await getDoc(metricRef);

    if (metricSnap.exists()) {
      return {
        success: true,
        metric: metricSnap.data(),
      };
    } else {
      return {
        success: false,
        error: 'Metric not found',
      };
    }
  } catch (error) {
    console.error('Error getting metric:', error);
    return {
      success: false,
      error: 'Failed to load metric',
    };
  }
};

/**
 * Get recent metrics (last N days)
 */
export const getRecentMetrics = async (userId, days = 30) => {
  try {
    const metricsRef = collection(db, 'users', userId, 'metrics');
    const q = query(
      metricsRef,
      orderBy('date', 'desc'),
      limit(days)
    );
    const querySnapshot = await getDocs(q);

    const metrics = [];
    querySnapshot.forEach((doc) => {
      metrics.push(doc.data());
    });

    return {
      success: true,
      metrics,
    };
  } catch (error) {
    console.error('Error getting recent metrics:', error);
    return {
      success: false,
      error: 'Failed to load recent metrics',
      metrics: [],
    };
  }
};
