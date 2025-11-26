import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { format, differenceInDays, parseISO } from 'date-fns';
import {
  getUserProfile,
  getTodayMetric,
  PHASES,
  checkPhaseAdvancement,
  getRatioColor,
  getRatioStatus,
} from '../utils/storage';

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [todayMetric, setTodayMetric] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      let prof = await getUserProfile();
      prof = await checkPhaseAdvancement(prof);
      setProfile(prof);
      
      const metric = await getTodayMetric();
      setTodayMetric(metric);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const phase = PHASES[profile.currentPhase];
  const daysInPhase = differenceInDays(
    new Date(),
    parseISO(profile.phaseStartDate)
  );
  const daysTotal = phase.duration || '∞';
  const ratio = todayMetric?.drBozRatio;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Phase Card */}
        <View style={styles.card}>
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseNumber}>PHASE {profile.currentPhase}</Text>
            <Text style={styles.phaseDays}>
              Day {daysInPhase + 1} of {daysTotal}
            </Text>
          </View>
          <Text style={styles.phaseName}>{phase.name}</Text>
          <Text style={styles.phaseDescription}>{phase.description}</Text>
          
          {phase.duration && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((daysInPhase / phase.duration) * 100, 100)}%`,
                  },
                ]}
              />
            </View>
          )}
        </View>

        {/* Today's Ratio */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Dr. Boz Ratio</Text>
          {ratio !== null && ratio !== undefined ? (
            <>
              <Text
                style={[
                  styles.ratioValue,
                  { color: getRatioColor(ratio) },
                ]}
              >
                {ratio}
              </Text>
              <Text style={styles.ratioStatus}>{getRatioStatus(ratio)}</Text>
              <View style={styles.ratioDetails}>
                <Text style={styles.ratioDetail}>
                  Glucose: {todayMetric.glucose} mmol/L
                </Text>
                <Text style={styles.ratioDetail}>
                  Ketones: {todayMetric.ketones} mmol/L
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No metrics logged today</Text>
              <TouchableOpacity
                style={styles.logButton}
                onPress={() => navigation.navigate('Log')}
              >
                <Text style={styles.logButtonText}>Log Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Today's Action */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Focus</Text>
          <Text style={styles.actionText}>{phase.requirements}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Log')}
          >
            <Text style={styles.primaryButtonText}>Log Metrics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Phase')}
          >
            <Text style={styles.secondaryButtonText}>Phase Details</Text>
          </TouchableOpacity>
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
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
    letterSpacing: 1,
  },
  phaseDays: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  phaseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  phaseDescription: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  ratioValue: {
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  ratioStatus: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 16,
  },
  ratioDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  ratioDetail: {
    fontSize: 14,
    color: '#4b5563',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  logButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 18,
    fontWeight: '700',
  },
});
