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
import { useTheme } from '../contexts/ThemeContext';
import { getUserProfile, PHASES, checkPhaseAdvancement } from '../utils/storage';

export default function PhaseInfoScreen() {
  const { theme } = useTheme();
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textSecondary }}>Loading...</Text>
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Current Phase */}
        <View style={[styles.currentCard, { backgroundColor: theme.colors.accent, shadowColor: theme.colors.shadow }]}>
          <Text style={[styles.currentLabel, { color: theme.colors.accentBackground }]}>CURRENT PHASE</Text>
          <Text style={styles.currentNumber}>Phase {profile.currentPhase}</Text>
          <Text style={styles.currentName}>{currentPhase.name}</Text>
          <Text style={[styles.currentDescription, { color: theme.colors.accentBackground }]}>
            {currentPhase.description}
          </Text>
          
          {currentPhase.duration ? (
            <>
              <View style={styles.progressContainer}>
                <Text style={[styles.progressText, { color: theme.colors.accentBackground }]}>
                  Day {daysInPhase + 1} of {currentPhase.duration}
                </Text>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.accentBackground + '40' }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          ((daysInPhase + 1) / currentPhase.duration) * 100,
                          100
                        )}%`,
                        backgroundColor: theme.colors.card,
                      },
                    ]}
                  />
                </View>
              </View>
            </>
          ) : (
            <Text style={[styles.maintenanceText, { color: theme.colors.accentBackground }]}>
              Maintenance Phase - Continue as long as needed
            </Text>
          )}

          <View style={[styles.requirementsBox, { backgroundColor: theme.colors.accentBackground + '40' }]}>
            <Text style={[styles.requirementsTitle, { color: theme.colors.accentBackground }]}>Requirements</Text>
            <Text style={styles.requirementsText}>
              {currentPhase.requirements}
            </Text>
          </View>
        </View>

        {/* Phase Timeline */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Complete Continuum</Text>
          {Object.entries(PHASES).map(([num, phase]) => {
            const phaseNum = parseInt(num);
            const isCompleted = phaseNum < profile.currentPhase;
            const isCurrent = phaseNum === profile.currentPhase;

            return (
              <View
                key={num}
                style={[
                  styles.phaseItem,
                  { borderBottomColor: theme.colors.border },
                  isCurrent && [styles.phaseItemCurrent, { backgroundColor: theme.colors.accentBackground }],
                  isCompleted && styles.phaseItemCompleted,
                ]}
              >
                <View style={styles.phaseLeft}>
                  <View
                    style={[
                      styles.phaseDot,
                      { backgroundColor: theme.colors.border },
                      isCurrent && { backgroundColor: theme.colors.accent },
                      isCompleted && { backgroundColor: theme.colors.success },
                    ]}
                  >
                    <Text
                      style={[
                        styles.phaseDotText,
                        { color: theme.colors.textSecondary },
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
                      { color: theme.colors.text },
                      isCurrent && [styles.phaseNameCurrent, { color: theme.colors.accent }],
                    ]}
                  >
                    {phase.name}
                  </Text>
                  <Text style={[styles.phaseDesc, { color: theme.colors.textSecondary }]}>{phase.description}</Text>
                  {phase.duration && (
                    <Text style={[styles.phaseDuration, { color: theme.colors.textSecondary }]}>
                      Duration: {phase.duration} days
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Educational Content */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Understanding the Process</Text>
          <Text style={[styles.educationText, { color: theme.colors.textSecondary }]}>
            The Keto Continuum is a progressive approach to achieving and
            maintaining metabolic health through ketosis. Each phase builds on
            the previous one, gradually increasing metabolic stress to drive
            deeper healing.
          </Text>
          <Text style={[styles.educationText, { color: theme.colors.textSecondary }]}>
            Your Dr. Boz Ratio (glucose ÷ ketones) is the key metric. Lower is
            better:
          </Text>
          <View style={[styles.ratioGuide, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.ratioGuideItem, { color: theme.colors.textSecondary }]}>
              • <Text style={{ color: theme.colors.success }}>Under 40</Text>: Excellent -
              Deep ketosis, maximum autophagy
            </Text>
            <Text style={[styles.ratioGuideItem, { color: theme.colors.textSecondary }]}>
              • <Text style={{ color: theme.colors.warning }}>40-80</Text>: Good -
              Therapeutic ketosis
            </Text>
            <Text style={[styles.ratioGuideItem, { color: theme.colors.textSecondary }]}>
              • <Text style={{ color: theme.colors.error }}>Over 80</Text>: Fair - Light
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
  },
  content: {
    padding: 16,
  },
  currentCard: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: '700',
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
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  maintenanceText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  requirementsBox: {
    borderRadius: 8,
    padding: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  requirementsText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  phaseItem: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  phaseItemCurrent: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseDotText: {
    fontSize: 14,
    fontWeight: 'bold',
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
    marginBottom: 4,
  },
  phaseNameCurrent: {
    fontSize: 18,
  },
  phaseDesc: {
    fontSize: 14,
    marginBottom: 4,
  },
  phaseDuration: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  educationText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  ratioGuide: {
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  ratioGuideItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});
