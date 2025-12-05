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
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section - Phase & Today's Ratio */}
      <View style={styles.heroSection}>
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseBadgeText}>Phase {profile.currentPhase}</Text>
        </View>
        <Text style={styles.phaseName}>{phase.name}</Text>
        <Text style={styles.phaseSubtext}>{phase.description}</Text>
        
        {phase.duration && (
          <View style={styles.progressContainer}>
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
            <Text style={styles.progressText}>
              Day {daysInPhase + 1} of {daysTotal}
            </Text>
          </View>
        )}
      </View>

      {/* Today's Ratio - Large Display */}
      <View style={styles.ratioCard}>
        {ratio !== null && ratio !== undefined ? (
          <>
            <Text style={styles.ratioLabel}>Today's Ratio</Text>
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
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Glucose</Text>
                <Text style={styles.metricValue}>{todayMetric.glucose} mmol/L</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Ketones</Text>
                <Text style={styles.metricValue}>{todayMetric.ketones} mmol/L</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No metrics logged today</Text>
            <TouchableOpacity
              style={styles.logButton}
              onPress={() => navigation.navigate('Log')}
            >
              <Text style={styles.logButtonText}>Log Metrics</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Progress Chart */}
      {chartData && (
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Progress</Text>
            <Text style={styles.chartSubtitle}>Last 30 days</Text>
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
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 0,
              },
              propsForDots: (dataPoint, index) => {
                const ratio = chartData.ratios && chartData.ratios[index];
                const color = ratio !== null && ratio !== undefined 
                  ? getRatioColor(ratio) 
                  : '#9ca3af';
                return {
                  r: '4',
                  strokeWidth: '2',
                  stroke: color,
                  fill: color,
                };
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: '#f3f4f6',
                strokeWidth: 1,
              },
            }}
            bezier
            style={styles.chart}
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>&lt;40</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>40-80</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>&gt;80</Text>
            </View>
          </View>
        </View>
      )}

      {/* Stats Grid */}
      {stats && (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={[styles.statValue, { color: getRatioColor(stats.average) }]}>
              {stats.average}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Best</Text>
            <Text style={[styles.statValue, { color: getRatioColor(stats.min) }]}>
              {stats.min}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Highest</Text>
            <Text style={[styles.statValue, { color: getRatioColor(stats.max) }]}>
              {stats.max}
            </Text>
          </View>
        </View>
      )}

      {/* Recent Entries - Compact List */}
      {allMetrics.length > 0 && (
        <View style={styles.entriesCard}>
          <View style={styles.entriesHeader}>
            <Text style={styles.entriesTitle}>Recent Entries</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Log')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {allMetrics
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map((metric, index) => (
              <TouchableOpacity
                key={index}
                style={styles.entryRow}
                onPress={() => navigation.navigate('Log', { date: metric.date })}
                activeOpacity={0.6}
              >
                <Text style={styles.entryDate}>
                  {format(parseISO(metric.date), 'MMM d')}
                </Text>
                <View style={styles.entryMetrics}>
                  <Text style={styles.entryMetric}>
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
      <View style={styles.focusCard}>
        <Text style={styles.focusTitle}>Today's Focus</Text>
        <Text style={styles.focusText}>{phase.requirements}</Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('Log')}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>Log Metrics</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
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
    color: '#9ca3af',
  },
  heroSection: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  phaseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  phaseBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    letterSpacing: 0.5,
  },
  phaseName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  phaseSubtext: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 20,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  ratioCard: {
    margin: 20,
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  ratioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
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
    borderTopColor: '#f3f4f6',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#f3f4f6',
  },
  metricLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 20,
  },
  logButton: {
    backgroundColor: '#2563eb',
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
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
    color: '#111827',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
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
    color: '#6b7280',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
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
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  entryDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    width: 70,
  },
  entryMetrics: {
    flex: 1,
    marginLeft: 16,
  },
  entryMetric: {
    fontSize: 14,
    color: '#6b7280',
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  focusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  focusText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
  },
  actionButton: {
    marginHorizontal: 20,
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2563eb',
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
