import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import {
  getUserProfile,
  getTodayMetric,
  getDailyMetrics,
  PHASES,
  checkPhaseAdvancement,
  getRatioColor,
  getRatioStatus,
} from '../utils/storage';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [todayMetric, setTodayMetric] = useState(null);
  const [allMetrics, setAllMetrics] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      let prof = await getUserProfile();
      prof = await checkPhaseAdvancement(prof);
      setProfile(prof);
      
      const metric = await getTodayMetric();
      setTodayMetric(metric);

      const metrics = await getDailyMetrics();
      setAllMetrics(metrics);
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
        </View>
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

  // Prepare chart data (last 30 days)
  const recentMetrics = allMetrics
    .filter(m => {
      const daysDiff = Math.floor((new Date() - parseISO(m.date)) / (1000 * 60 * 60 * 24));
      return daysDiff <= 30;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartData = recentMetrics.length > 0 ? {
    labels: recentMetrics.map((m) => format(parseISO(m.date), 'MM/dd')),
    datasets: [{
      data: recentMetrics.map((m) => m.drBozRatio || 0),
      color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
      strokeWidth: 2,
    }],
    ratios: recentMetrics.map((m) => m.drBozRatio),
  } : null;

  // Calculate stats
  const ratios = allMetrics.map((m) => m.drBozRatio).filter((r) => r !== null);
  const stats = ratios.length > 0 ? {
    average: Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 10) / 10,
    min: Math.round(Math.min(...ratios) * 10) / 10,
    max: Math.round(Math.max(...ratios) * 10) / 10,
    latest: ratio || null,
  } : null;

  const dynamicStyles = getDynamicStyles(theme);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section - Phase & Today's Ratio */}
      <View style={[styles.heroSection, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={[styles.phaseBadge, { backgroundColor: theme.colors.accentBackground }]}>
          <Text style={[styles.phaseBadgeText, { color: theme.colors.accent }]}>Phase {profile.currentPhase}</Text>
        </View>
        <Text style={[styles.phaseName, { color: theme.colors.text }]}>{phase.name}</Text>
        <Text style={[styles.phaseSubtext, { color: theme.colors.textSecondary }]}>{phase.description}</Text>
        
        {phase.duration && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((daysInPhase / phase.duration) * 100, 100)}%`,
                    backgroundColor: theme.colors.accent,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              Day {daysInPhase + 1} of {daysTotal}
            </Text>
          </View>
        )}
      </View>

      {/* Today's Ratio - Large Display */}
      <View style={[styles.ratioCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
        {ratio !== null && ratio !== undefined ? (
          <>
            <Text style={[styles.ratioLabel, { color: theme.colors.textSecondary }]}>Today's Ratio</Text>
            <Text
              style={[
                styles.ratioValue,
                { color: getRatioColor(ratio) },
              ]}
            >
              {ratio}
            </Text>
            <Text style={[styles.ratioStatus, { color: getRatioColor(ratio) }]}>
              {getRatioStatus(ratio)}
            </Text>
            <View style={[styles.metricRow, { borderTopColor: theme.colors.border }]}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Glucose</Text>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>{todayMetric.glucose} mmol/L</Text>
              </View>
              <View style={[styles.metricDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Ketones</Text>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>{todayMetric.ketones} mmol/L</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>No metrics logged today</Text>
            <TouchableOpacity
              style={[styles.logButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => navigation.navigate('Log')}
            >
              <Text style={styles.logButtonText}>Log Metrics</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Progress Chart */}
      {chartData && (
        <View style={[styles.chartCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Progress</Text>
            <Text style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>Last 30 days</Text>
          </View>
          <LineChart
            data={chartData}
            width={screenWidth - 48}
            height={180}
            withDots={true}
            withShadow={false}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: 'transparent',
              backgroundGradientTo: 'transparent',
              decimalPlaces: 0,
              color: (opacity = 1) => {
                const rgb = hexToRgb(theme.colors.accent);
                return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
              },
              labelColor: (opacity = 1) => {
                const rgb = hexToRgb(theme.colors.textSecondary);
                return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
              },
              style: {
                borderRadius: 0,
              },
              propsForDots: (dataPoint, index) => {
                const ratio = chartData.ratios && chartData.ratios[index];
                const color = ratio !== null && ratio !== undefined 
                  ? getRatioColor(ratio) 
                  : theme.colors.textSecondary;
                return {
                  r: '4',
                  strokeWidth: '2',
                  stroke: color,
                  fill: color,
                };
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: theme.colors.border,
                strokeWidth: 1,
              },
            }}
            bezier
            style={styles.chart}
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>&lt;40</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>40-80</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>&gt;80</Text>
            </View>
          </View>
        </View>
      )}

      {/* Stats Grid */}
      {stats && (
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Average</Text>
            <Text style={[styles.statValue, { color: getRatioColor(stats.average) }]}>
              {stats.average}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Best</Text>
            <Text style={[styles.statValue, { color: getRatioColor(stats.min) }]}>
              {stats.min}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Highest</Text>
            <Text style={[styles.statValue, { color: getRatioColor(stats.max) }]}>
              {stats.max}
            </Text>
          </View>
        </View>
      )}

      {/* Recent Entries - Compact List */}
      {allMetrics.length > 0 && (
        <View style={[styles.entriesCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
          <View style={styles.entriesHeader}>
            <Text style={[styles.entriesTitle, { color: theme.colors.text }]}>Recent Entries</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Log')}
            >
              <Text style={[styles.viewAllText, { color: theme.colors.accent }]}>View All</Text>
            </TouchableOpacity>
          </View>
          {allMetrics
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map((metric, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.entryRow, { borderBottomColor: theme.colors.border }]}
                onPress={() => navigation.navigate('Log', { date: metric.date })}
                activeOpacity={0.6}
              >
                <Text style={[styles.entryDate, { color: theme.colors.text }]}>
                  {format(parseISO(metric.date), 'MMM d')}
                </Text>
                <View style={styles.entryMetrics}>
                  <Text style={[styles.entryMetric, { color: theme.colors.textSecondary }]}>
                    {metric.glucose}/{metric.ketones}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.entryRatio,
                    { color: getRatioColor(metric.drBozRatio) },
                  ]}
                >
                  {metric.drBozRatio}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      )}

      {/* Today's Focus */}
      <View style={[styles.focusCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
        <Text style={[styles.focusTitle, { color: theme.colors.text }]}>Today's Focus</Text>
        <Text style={[styles.focusText, { color: theme.colors.textSecondary }]}>{phase.requirements}</Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.accent, shadowColor: theme.colors.accent }]}
        onPress={() => navigation.navigate('Log')}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>Log Metrics</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 37, g: 99, b: 235 };
};

const getDynamicStyles = (theme) => ({
  // Dynamic styles can be added here if needed
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  heroSection: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
    borderBottomWidth: 1,
  },
  phaseBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  phaseBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  phaseName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  phaseSubtext: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
  },
  ratioCard: {
    margin: 20,
    marginTop: 24,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  ratioLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  ratioValue: {
    fontSize: 72,
    fontWeight: '700',
    letterSpacing: -2,
    marginBottom: 8,
  },
  ratioStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricRow: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 24,
    borderTopWidth: 1,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noDataText: {
    fontSize: 16,
    marginBottom: 20,
  },
  logButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  chart: {
    marginVertical: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  entriesCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  entriesTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  entryDate: {
    fontSize: 15,
    fontWeight: '600',
    width: 70,
  },
  entryMetrics: {
    flex: 1,
    marginLeft: 16,
  },
  entryMetric: {
    fontSize: 14,
  },
  entryRatio: {
    fontSize: 18,
    fontWeight: '700',
    width: 50,
    textAlign: 'right',
  },
  focusCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  focusTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  focusText: {
    fontSize: 15,
    lineHeight: 24,
  },
  actionButton: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
