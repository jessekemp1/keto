import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { format, parseISO } from 'date-fns';
import { getRecentMetrics, getDailyMetrics, getRatioColor } from '../utils/storage';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const [metrics, setMetrics] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMetrics = async () => {
    try {
      // Get all historical metrics, not just last 7 days
      const allData = await getDailyMetrics();
      setMetrics(allData);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMetrics();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMetrics();
    setRefreshing(false);
  };

  const getChartData = () => {
    if (metrics.length === 0) {
      return null;
    }

    // Show last 30 days on chart for readability, but all data in list
    const recentMetrics = metrics
      .filter(m => {
        const daysDiff = Math.floor((new Date() - parseISO(m.date)) / (1000 * 60 * 60 * 24));
        return daysDiff <= 30;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (recentMetrics.length === 0) {
      return null;
    }

    const labels = recentMetrics.map((m) => format(parseISO(m.date), 'MM/dd'));
    const ratios = recentMetrics.map((m) => m.drBozRatio || 0);

    return {
      labels,
      datasets: [
        {
          data: ratios,
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  };

  const getStats = () => {
    if (metrics.length === 0) return null;

    const ratios = metrics.map((m) => m.drBozRatio).filter((r) => r !== null);
    if (ratios.length === 0) return null;

    const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const min = Math.min(...ratios);
    const max = Math.max(...ratios);
    const latest = ratios[ratios.length - 1];

    return {
      average: Math.round(avg * 10) / 10,
      min: Math.round(min * 10) / 10,
      max: Math.round(max * 10) / 10,
      latest: Math.round(latest * 10) / 10,
    };
  };

  const chartData = getChartData();
  const stats = getStats();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Progress History</Text>

        {chartData ? (
          <>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Dr. Boz Ratio</Text>
              <LineChart
                data={chartData}
                width={screenWidth - 64}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#2563eb',
                  },
                }}
                bezier
                style={styles.chart}
              />
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.legendText}>&lt;40 Excellent</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                  <Text style={styles.legendText}>40-80 Good</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                  <Text style={styles.legendText}>&gt;80 Needs work</Text>
                </View>
              </View>
            </View>

            {stats && (
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Latest</Text>
                    <Text
                      style={[
                        styles.statValue,
                        { color: getRatioColor(stats.latest) },
                      ]}
                    >
                      {stats.latest}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>All-Time Avg</Text>
                    <Text
                      style={[
                        styles.statValue,
                        { color: getRatioColor(stats.average) },
                      ]}
                    >
                      {stats.average}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Best</Text>
                    <Text
                      style={[
                        styles.statValue,
                        { color: getRatioColor(stats.min) },
                      ]}
                    >
                      {stats.min}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Highest</Text>
                    <Text
                      style={[
                        styles.statValue,
                        { color: getRatioColor(stats.max) },
                      ]}
                    >
                      {stats.max}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.dataCard}>
              <Text style={styles.dataTitle}>All Entries ({metrics.length} total)</Text>
              {metrics
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((metric, index) => (
                  <View key={index} style={styles.dataRow}>
                    <Text style={styles.dataDate}>
                      {format(parseISO(metric.date), 'MMM d')}
                    </Text>
                    <View style={styles.dataValues}>
                      <Text style={styles.dataValue}>
                        G: {metric.glucose} | K: {metric.ketones}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.dataRatio,
                        { color: getRatioColor(metric.drBozRatio) },
                      ]}
                    >
                      {metric.drBozRatio}
                    </Text>
                  </View>
                ))}
            </View>
          </>
        ) : (
          <View style={styles.noDataCard}>
            <Text style={styles.noDataText}>No data yet</Text>
            <Text style={styles.noDataSubtext}>
              Start logging your daily metrics to see progress
            </Text>
          </View>
        )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  chartCard: {
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
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  dataCard: {
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
  dataTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dataDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 60,
  },
  dataValues: {
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  dataRatio: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'right',
  },
  noDataCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noDataText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
