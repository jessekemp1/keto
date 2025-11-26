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
          </View>

          {ratio !== null && (
            <View style={[styles.ratioCard, { borderColor: getRatioColor(ratio) }]}>
              <Text style={styles.ratioLabel}>Dr. Boz Ratio</Text>
              <Text style={[styles.ratioValue, { color: getRatioColor(ratio) }]}>
                {ratio}
              </Text>
              <Text style={styles.ratioStatus}>{getRatioStatus(ratio)}</Text>
            </View>
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
});
