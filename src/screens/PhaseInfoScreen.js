import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { format, parseISO, differenceInDays } from 'date-fns';
import { getUserProfile, PHASES, checkPhaseAdvancement } from '../utils/storage';

export default function PhaseInfoScreen() {
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      let prof = await getUserProfile();
      prof = await checkPhaseAdvancement(prof);
      setProfile(prof);
    } catch (error) {
      console.error('Error loading profile:', error);
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

  const currentPhase = PHASES[profile.currentPhase];
  const daysInPhase = differenceInDays(
    new Date(),
    parseISO(profile.phaseStartDate)
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Current Phase */}
        <View style={styles.currentCard}>
          <Text style={styles.currentLabel}>CURRENT PHASE</Text>
          <Text style={styles.currentNumber}>Phase {profile.currentPhase}</Text>
          <Text style={styles.currentName}>{currentPhase.name}</Text>
          <Text style={styles.currentDescription}>
            {currentPhase.description}
          </Text>
          
          {currentPhase.duration ? (
            <>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Day {daysInPhase + 1} of {currentPhase.duration}
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          ((daysInPhase + 1) / currentPhase.duration) * 100,
                          100
                        )}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.maintenanceText}>
              Maintenance Phase - Continue as long as needed
            </Text>
          )}

          <View style={styles.requirementsBox}>
            <Text style={styles.requirementsTitle}>Requirements</Text>
            <Text style={styles.requirementsText}>
              {currentPhase.requirements}
            </Text>
          </View>
        </View>

        {/* Phase Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Complete Continuum</Text>
          {Object.entries(PHASES).map(([num, phase]) => {
            const phaseNum = parseInt(num);
            const isCompleted = phaseNum < profile.currentPhase;
            const isCurrent = phaseNum === profile.currentPhase;

            return (
              <View
                key={num}
                style={[
                  styles.phaseItem,
                  isCurrent && styles.phaseItemCurrent,
                  isCompleted && styles.phaseItemCompleted,
                ]}
              >
                <View style={styles.phaseLeft}>
                  <View
                    style={[
                      styles.phaseDot,
                      isCurrent && styles.phaseDotCurrent,
                      isCompleted && styles.phaseDotCompleted,
                    ]}
                  >
                    <Text
                      style={[
                        styles.phaseDotText,
                        (isCurrent || isCompleted) && styles.phaseDotTextActive,
                      ]}
                    >
                      {num}
                    </Text>
                  </View>
                </View>
                <View style={styles.phaseRight}>
                  <Text
                    style={[
                      styles.phaseName,
                      isCurrent && styles.phaseNameCurrent,
                    ]}
                  >
                    {phase.name}
                  </Text>
                  <Text style={styles.phaseDesc}>{phase.description}</Text>
                  {phase.duration && (
                    <Text style={styles.phaseDuration}>
                      Duration: {phase.duration} days
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Educational Content */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Understanding the Process</Text>
          <Text style={styles.educationText}>
            The Keto Continuum is a progressive approach to achieving and
            maintaining metabolic health through ketosis. Each phase builds on
            the previous one, gradually increasing metabolic stress to drive
            deeper healing.
          </Text>
          <Text style={styles.educationText}>
            Your Dr. Boz Ratio (glucose ÷ ketones) is the key metric. Lower is
            better:
          </Text>
          <View style={styles.ratioGuide}>
            <Text style={styles.ratioGuideItem}>
              • <Text style={{ color: '#10b981' }}>Under 40</Text>: Excellent -
              Deep ketosis, maximum autophagy
            </Text>
            <Text style={styles.ratioGuideItem}>
              • <Text style={{ color: '#f59e0b' }}>40-80</Text>: Good -
              Therapeutic ketosis
            </Text>
            <Text style={styles.ratioGuideItem}>
              • <Text style={{ color: '#ef4444' }}>Over 80</Text>: Fair - Light
              ketosis, room for improvement
            </Text>
          </View>
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
  currentCard: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#93c5fd',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  currentNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  currentName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  currentDescription: {
    fontSize: 16,
    color: '#dbeafe',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dbeafe',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1e40af',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
  },
  maintenanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dbeafe',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  requirementsBox: {
    backgroundColor: '#1e40af',
    borderRadius: 8,
    padding: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#93c5fd',
    marginBottom: 8,
  },
  requirementsText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
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
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  phaseItem: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  phaseItemCurrent: {
    backgroundColor: '#eff6ff',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  phaseItemCompleted: {
    opacity: 0.6,
  },
  phaseLeft: {
    marginRight: 16,
  },
  phaseDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseDotCurrent: {
    backgroundColor: '#2563eb',
  },
  phaseDotCompleted: {
    backgroundColor: '#10b981',
  },
  phaseDotText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  phaseDotTextActive: {
    color: '#ffffff',
  },
  phaseRight: {
    flex: 1,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  phaseNameCurrent: {
    color: '#2563eb',
    fontSize: 18,
  },
  phaseDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  phaseDuration: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  educationText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  ratioGuide: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  ratioGuideItem: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 20,
  },
});
