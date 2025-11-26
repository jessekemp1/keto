import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { format } from 'date-fns';
import {
  saveDailyMetric,
  getTodayMetric,
  calculateDrBozRatio,
  getRatioColor,
  getRatioStatus,
} from '../utils/storage';

// Expandable help tip component
function HelpTip({ title, children }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.helpTip}>
      <TouchableOpacity
        style={styles.helpHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.helpIcon}>{expanded ? '▼' : '▶'}</Text>
        <Text style={styles.helpTitle}>{title}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.helpContent}>
          {children}
        </View>
      )}
    </View>
  );
}

export default function LogMetricsScreen({ navigation }) {
  const [glucose, setGlucose] = useState('');
  const [ketones, setKetones] = useState('');
  const [weight, setWeight] = useState('');
  const [energy, setEnergy] = useState('');
  const [clarity, setClarity] = useState('');
  const [ratio, setRatio] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    const todayData = await getTodayMetric();
    if (todayData) {
      setGlucose(todayData.glucose?.toString() || '');
      setKetones(todayData.ketones?.toString() || '');
      setWeight(todayData.weight?.toString() || '');
      setEnergy(todayData.energy?.toString() || '');
      setClarity(todayData.clarity?.toString() || '');
    }
  };

  useEffect(() => {
    const g = parseFloat(glucose);
    const k = parseFloat(ketones);
    if (!isNaN(g) && !isNaN(k) && k > 0) {
      setRatio(calculateDrBozRatio(g, k));
    } else {
      setRatio(null);
    }
  }, [glucose, ketones]);

  const handleSave = async () => {
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
        weight: weight ? parseFloat(weight) : null,
        energy: energy ? parseInt(energy) : null,
        clarity: clarity ? parseInt(clarity) : null,
      };

      await saveDailyMetric(metric);

      Alert.alert(
        'Success!',
        `Metrics saved\nDr. Boz Ratio: ${metric.drBozRatio}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save metrics. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const validateNumber = (text, setter, max = null) => {
    // Allow empty, digits, and one decimal point
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      if (max && parseFloat(text) > max) {
        return;
      }
      setter(text);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Log Today's Metrics</Text>
        <Text style={styles.subtitle}>{format(new Date(), 'MMMM d, yyyy')}</Text>

        {/* Required Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fasting Glucose (mmol/L)</Text>
            <TextInput
              style={styles.input}
              value={glucose}
              onChangeText={(text) => validateNumber(text, setGlucose, 30)}
              keyboardType="decimal-pad"
              placeholder="e.g. 4.7"
              placeholderTextColor="#9ca3af"
            />
            <HelpTip title="💡 How to measure glucose">
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>When to measure:</Text> First thing in the morning, after 12+ hours of fasting (no food or drinks except water).
              </Text>
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>Normal range:</Text> 3.9-5.6 mmol/L (70-100 mg/dL) for non-diabetics.
              </Text>
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>Keto target:</Text> Aim for 3.3-5.0 mmol/L (60-90 mg/dL) for optimal ketosis.
              </Text>
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>Device:</Text> Use a blood glucose meter with test strips. Prick your finger and apply blood to the strip.
              </Text>
            </HelpTip>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Blood Ketones (mmol/L)</Text>
            <TextInput
              style={styles.input}
              value={ketones}
              onChangeText={(text) => validateNumber(text, setKetones, 10)}
              keyboardType="decimal-pad"
              placeholder="e.g. 1.2"
              placeholderTextColor="#9ca3af"
            />
            <HelpTip title="💡 How to measure ketones">
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>When to measure:</Text> Same time as glucose (fasting), using the same finger prick for convenience.
              </Text>
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>Blood ketones (most accurate):</Text> Use a blood ketone meter with ketone test strips. Range: 0.5-3.0 mmol/L indicates nutritional ketosis.
              </Text>
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>Alternatives:</Text> Breath meters (less accurate) or urine strips (cheapest but unreliable for long-term keto).
              </Text>
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>Keto target:</Text> 1.0-3.0 mmol/L is optimal for therapeutic ketosis. Higher isn't always better.
              </Text>
            </HelpTip>
          </View>

          {ratio !== null && (
            <>
              <View style={[styles.ratioCard, { borderColor: getRatioColor(ratio) }]}>
                <Text style={styles.ratioLabel}>Dr. Boz Ratio</Text>
                <Text style={[styles.ratioValue, { color: getRatioColor(ratio) }]}>
                  {ratio}
                </Text>
                <Text style={styles.ratioStatus}>{getRatioStatus(ratio)}</Text>
              </View>
              <HelpTip title="💡 Understanding the Dr. Boz Ratio">
                <Text style={styles.helpText}>
                  <Text style={styles.helpBold}>Formula:</Text> Glucose (mmol/L) ÷ Ketones (mmol/L)
                </Text>
                <Text style={styles.helpText}>
                  <Text style={styles.helpBold}>What it means:</Text> This ratio indicates how well your metabolism is adapted to burning fat for fuel. Lower ratios = deeper ketosis and more autophagy.
                </Text>
                <Text style={styles.helpText}>
                  <Text style={styles.helpBold}>Target ranges:</Text>
                  {'\n'}• Under 40: Excellent - maximum healing and autophagy
                  {'\n'}• 40-80: Good - therapeutic ketosis
                  {'\n'}• 80-100: Fair - light ketosis, room for improvement
                  {'\n'}• Over 100: Not in therapeutic ketosis yet
                </Text>
                <Text style={styles.helpText}>
                  <Text style={styles.helpBold}>Example:</Text> Glucose 4.5 ÷ Ketones 1.5 = Ratio of 30 (Excellent!)
                </Text>
              </HelpTip>
            </>
          )}
        </View>

        {/* Optional Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Optional</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (lbs)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={(text) => validateNumber(text, setWeight, 999)}
              keyboardType="decimal-pad"
              placeholder="e.g. 180"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Energy Level (1-10)</Text>
            <TextInput
              style={styles.input}
              value={energy}
              onChangeText={(text) => validateNumber(text, setEnergy, 10)}
              keyboardType="number-pad"
              placeholder="e.g. 8"
              placeholderTextColor="#9ca3af"
            />
            <HelpTip title="💡 Tracking energy levels">
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>Scale:</Text> 1 = Exhausted, can barely function; 10 = Peak energy, unstoppable
              </Text>
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>When to assess:</Text> Mid-afternoon (2-4 PM) when energy typically dips
              </Text>
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>What to look for:</Text> As you progress through ketosis, you should notice sustained energy without crashes, especially after the initial "keto flu" adaptation period.
              </Text>
            </HelpTip>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mental Clarity (1-10)</Text>
            <TextInput
              style={styles.input}
              value={clarity}
              onChangeText={(text) => validateNumber(text, setClarity, 10)}
              keyboardType="number-pad"
              placeholder="e.g. 9"
              placeholderTextColor="#9ca3af"
            />
            <HelpTip title="💡 Tracking mental clarity">
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>Scale:</Text> 1 = Brain fog, can't focus; 10 = Crystal clear thinking, laser focus
              </Text>
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>When to assess:</Text> During your most mentally demanding tasks (work, study, problem-solving)
              </Text>
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>What to look for:</Text> Many people report enhanced mental clarity and focus as a major benefit of ketosis. Ketones provide stable brain fuel without glucose spikes/crashes.
              </Text>
            </HelpTip>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Metrics'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    color: '#111827',
  },
  ratioCard: {
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  ratioLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  ratioValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratioStatus: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  helpTip: {
    marginTop: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
    overflow: 'hidden',
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  helpIcon: {
    fontSize: 12,
    color: '#2563eb',
    marginRight: 8,
    fontWeight: 'bold',
  },
  helpTitle: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    flex: 1,
  },
  helpContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  helpBold: {
    fontWeight: '700',
    color: '#111827',
  },
});
