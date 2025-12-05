import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  TextInput,
  Alert,
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
  saveDailyMetric,
  calculateDrBozRatio,
} from '../utils/storage';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [todayMetric, setTodayMetric] = useState(null);
  const [allMetrics, setAllMetrics] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [logFormExpanded, setLogFormExpanded] = useState(false);
  const [glucose, setGlucose] = useState('');
  const [ketones, setKetones] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleLogSave = async () => {
    const g = parseFloat(glucose);
    const k = parseFloat(ketones);

    if (isNaN(g) || isNaN(k)) {
      Alert.alert('Error', 'Please enter valid glucose and ketone values');
      return;
    }

    if (g <= 0 || k <= 0) {
      Alert.alert('Error', 'Values must be greater than zero');
      return;
    }

    setSaving(true);
    try {
      const metric = {
        date: format(new Date(), 'yyyy-MM-dd'),
        glucose: g,
        ketones: k,
        drBozRatio: calculateDrBozRatio(g, k),
      };

      await saveDailyMetric(metric);
      setGlucose('');
      setKetones('');
      setLogFormExpanded(false);
      await loadData();
      Alert.alert('Success!', `Metrics saved. Dr. Boz Ratio: ${metric.drBozRatio}`);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save metrics. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const validateNumber = (text, setter, max = null) => {
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      if (max && parseFloat(text) > max) {
        return;
      }
      setter(text);
    }
  };

  const calculatedRatio = glucose && ketones 
    ? calculateDrBozRatio(parseFloat(glucose), parseFloat(ketones))
    : null;

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
      {/* Phase Section with Integrated Metrics */}
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

        {/* Today's Ratio - Inline Display */}
        {ratio !== null && ratio !== undefined && (
          <View style={[styles.inlineRatioContainer, { borderTopColor: theme.colors.border }]}>
            <View style={styles.inlineRatioLeft}>
              <Text style={[styles.inlineRatioLabel, { color: theme.colors.textSecondary }]}>Today's Ratio</Text>
              <Text style={[styles.inlineRatioValue, { color: getRatioColor(ratio) }]}>{ratio}</Text>
              <Text style={[styles.inlineRatioStatus, { color: getRatioColor(ratio) }]}>
                {getRatioStatus(ratio)}
              </Text>
            </View>
            <View style={styles.inlineRatioRight}>
              <Text style={[styles.inlineMetricLabel, { color: theme.colors.textSecondary }]}>Glucose</Text>
              <Text style={[styles.inlineMetricValue, { color: theme.colors.text }]}>{todayMetric.glucose} mmol/L</Text>
              <Text style={[styles.inlineMetricLabel, { color: theme.colors.textSecondary, marginTop: 8 }]}>Ketones</Text>
              <Text style={[styles.inlineMetricValue, { color: theme.colors.text }]}>{todayMetric.ketones} mmol/L</Text>
            </View>
          </View>
        )}

        {/* Today's Focus */}
        <View style={[styles.inlineFocusContainer, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.inlineFocusTitle, { color: theme.colors.text }]}>Today's Focus</Text>
          <Text style={[styles.inlineFocusText, { color: theme.colors.textSecondary }]}>{phase.requirements}</Text>
        </View>

        {/* Expandable Log Form */}
        <View style={[styles.logFormContainer, { borderTopColor: theme.colors.border }]}>
          {!logFormExpanded ? (
            <TouchableOpacity
              style={[styles.logFormButton, { backgroundColor: theme.colors.accentBackground, borderColor: theme.colors.accent }]}
              onPress={() => setLogFormExpanded(true)}
            >
              <Text style={[styles.logFormButtonText, { color: theme.colors.accent }]}>
                {ratio !== null ? 'Update Today\'s Metrics' : '+ Log Today\'s Metrics'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.logFormExpanded}>
              <View style={styles.logFormRow}>
                <View style={styles.logFormInputGroup}>
                  <Text style={[styles.logFormLabel, { color: theme.colors.text }]}>Glucose (mmol/L)</Text>
                  <TextInput
                    style={[styles.logFormInput, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                    value={glucose}
                    onChangeText={(text) => validateNumber(text, setGlucose, 30)}
                    keyboardType="decimal-pad"
                    placeholder="4.7"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
                <View style={styles.logFormInputGroup}>
                  <Text style={[styles.logFormLabel, { color: theme.colors.text }]}>Ketones (mmol/L)</Text>
                  <TextInput
                    style={[styles.logFormInput, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                    value={ketones}
                    onChangeText={(text) => validateNumber(text, setKetones, 10)}
                    keyboardType="decimal-pad"
                    placeholder="1.2"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>
              {calculatedRatio !== null && (
                <View style={[styles.logFormRatioPreview, { backgroundColor: theme.colors.accentBackground }]}>
                  <Text style={[styles.logFormRatioLabel, { color: theme.colors.textSecondary }]}>Ratio</Text>
                  <Text style={[styles.logFormRatioValue, { color: getRatioColor(calculatedRatio) }]}>
                    {calculatedRatio}
                  </Text>
                </View>
              )}
              <View style={styles.logFormActions}>
                <TouchableOpacity
                  style={[styles.logFormCancelButton, { borderColor: theme.colors.border }]}
                  onPress={() => {
                    setLogFormExpanded(false);
                    setGlucose('');
                    setKetones('');
                  }}
                >
                  <Text style={[styles.logFormCancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.logFormSaveButton, { backgroundColor: theme.colors.accent }]}
                  onPress={handleLogSave}
                  disabled={saving || !glucose || !ketones}
                >
                  <Text style={styles.logFormSaveText}>
                    {saving ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
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
  inlineRatioContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  inlineRatioLeft: {
    flex: 1,
  },
  inlineRatioLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inlineRatioValue: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  inlineRatioStatus: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inlineRatioRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  inlineMetricLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  inlineMetricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  inlineFocusContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  inlineFocusTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  inlineFocusText: {
    fontSize: 14,
    lineHeight: 20,
  },
  logFormContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  logFormButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  logFormButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logFormExpanded: {
    marginTop: 8,
  },
  logFormRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  logFormInputGroup: {
    flex: 1,
  },
  logFormLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  logFormInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  logFormRatioPreview: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  logFormRatioLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  logFormRatioValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  logFormActions: {
    flexDirection: 'row',
    gap: 12,
  },
  logFormCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  logFormCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logFormSaveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logFormSaveText: {
    color: '#ffffff',
    fontSize: 14,
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
});
