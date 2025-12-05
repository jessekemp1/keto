import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { format, parseISO } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import {
  saveDailyMetric,
  getTodayMetric,
  getDailyMetrics,
  calculateDrBozRatio,
  getRatioColor,
  getRatioStatus,
} from '../utils/storage';

// Web date input component
const WebDateInput = ({ value, max, onChange, style, theme }) => {
  if (Platform.OS !== 'web') return null;
  
  return React.createElement('input', {
    type: 'date',
    value: value,
    max: max,
    onChange: (e) => onChange(e.target.value),
    style: {
      flex: 1,
      padding: '8px',
      fontSize: '16px',
      border: `1px solid ${theme?.colors?.border || '#bfdbfe'}`,
      borderRadius: '6px',
      backgroundColor: theme?.colors?.card || '#ffffff',
      color: theme?.colors?.text || '#1e40af',
      fontFamily: 'inherit',
      ...style,
    },
  });
};

// Expandable help tip component
function HelpTip({ title, children, theme }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.helpTip, { backgroundColor: theme.colors.accentBackground, borderLeftColor: theme.colors.accent }]}>
      <TouchableOpacity
        style={styles.helpHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={[styles.helpIcon, { color: theme.colors.accent }]}>{expanded ? '▼' : '▶'}</Text>
        <Text style={[styles.helpTitle, { color: theme.colors.accent }]}>{title}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.helpContent}>
          {children}
        </View>
      )}
    </View>
  );
}

export default function LogMetricsScreen({ navigation, route }) {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [glucose, setGlucose] = useState('');
  const [ketones, setKetones] = useState('');
  const [weight, setWeight] = useState('');
  const [energy, setEnergy] = useState('');
  const [clarity, setClarity] = useState('');
  const [ratio, setRatio] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Check if a date was passed via route params (for editing past dates)
    const dateParam = route?.params?.date;
    if (dateParam) {
      setSelectedDate(dateParam);
    }
    loadDateData();
  }, [selectedDate, route?.params?.date]);

  const loadDateData = async () => {
    const allMetrics = await getDailyMetrics();
    const dateData = allMetrics.find(m => m.date === selectedDate);
    if (dateData) {
      setGlucose(dateData.glucose?.toString() || '');
      setKetones(dateData.ketones?.toString() || '');
      setWeight(dateData.weight?.toString() || '');
      setEnergy(dateData.energy?.toString() || '');
      setClarity(dateData.clarity?.toString() || '');
      setIsEditing(true); // Mark as editing existing entry
    } else {
      // Clear fields if no data for selected date
      setGlucose('');
      setKetones('');
      setWeight('');
      setEnergy('');
      setClarity('');
      setIsEditing(false); // Mark as new entry
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

    // Validate date is not in the future
    const selectedDateObj = parseISO(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDateObj > today) {
      Alert.alert('Error', 'Cannot log metrics for future dates');
      return;
    }

    setSaving(true);

    try {
      const metric = {
        date: selectedDate,
        glucose: g,
        ketones: k,
        drBozRatio: calculateDrBozRatio(g, k),
        weight: weight ? parseFloat(weight) : null,
        energy: energy ? parseInt(energy) : null,
        clarity: clarity ? parseInt(clarity) : null,
      };

      const savedMetrics = await saveDailyMetric(metric);
      
      // Verify save succeeded
      if (!savedMetrics || savedMetrics.length === 0) {
        throw new Error('Save verification failed');
      }

      const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
      const dateDisplay = isToday 
        ? 'today' 
        : format(parseISO(selectedDate), 'MMMM d, yyyy');

      const actionText = isEditing ? 'updated' : 'saved';
      Alert.alert(
        'Success!',
        `Metrics ${actionText} for ${dateDisplay}\nDr. Boz Ratio: ${metric.drBozRatio}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error.message || 'Failed to save metrics. Please try again.';
      Alert.alert('Error', errorMessage);
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

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
  const dateDisplay = isToday 
    ? format(new Date(), 'MMMM d, yyyy')
    : format(parseISO(selectedDate), 'MMMM d, yyyy');

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {isEditing ? 'Edit Entry' : 'Log Metrics'}
        </Text>
        <View style={[styles.dateSection, { backgroundColor: theme.colors.accentBackground, borderColor: theme.colors.accent + '40' }]}>
          <Text style={[styles.dateLabel, { color: theme.colors.accent }]}>Date:</Text>
          {Platform.OS === 'web' ? (
            <View style={styles.dateInputContainer}>
              <WebDateInput
                value={selectedDate}
                max={format(new Date(), 'yyyy-MM-dd')}
                onChange={setSelectedDate}
                theme={theme}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent + '40' }]}
              onPress={() => {
                // For native, you could open a date picker here
                // For now, show an alert with instructions
                Alert.alert(
                  'Select Date',
                  'Date picker coming soon. For now, you can edit past dates by tapping on entries in the Progress screen.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={[styles.dateButtonText, { color: theme.colors.accent }]}>{dateDisplay}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Required Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Required</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Fasting Glucose (mmol/L)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={glucose}
              onChangeText={(text) => validateNumber(text, setGlucose, 30)}
              keyboardType="decimal-pad"
              placeholder="e.g. 4.7"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <HelpTip title="💡 How to measure glucose" theme={theme}>
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                <Text style={[styles.helpBold, { color: theme.colors.text }]}>When to measure:</Text> First thing in the morning, after 12+ hours of fasting (no food or drinks except water).
              </Text>
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                <Text style={[styles.helpBold, { color: theme.colors.text }]}>Normal range:</Text> 3.9-5.6 mmol/L (70-100 mg/dL) for non-diabetics.
              </Text>
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                <Text style={[styles.helpBold, { color: theme.colors.text }]}>Keto target:</Text> Aim for 3.3-5.0 mmol/L (60-90 mg/dL) for optimal ketosis.
              </Text>
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                <Text style={[styles.helpBold, { color: theme.colors.text }]}>Device:</Text> Use a blood glucose meter with test strips. Prick your finger and apply blood to the strip.
              </Text>
            </HelpTip>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Blood Ketones (mmol/L)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={ketones}
              onChangeText={(text) => validateNumber(text, setKetones, 10)}
              keyboardType="decimal-pad"
              placeholder="e.g. 1.2"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <HelpTip title="💡 How to measure ketones" theme={theme}>
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                <Text style={[styles.helpBold, { color: theme.colors.text }]}>When to measure:</Text> Same time as glucose (fasting), using the same finger prick for convenience.
              </Text>
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                <Text style={[styles.helpBold, { color: theme.colors.text }]}>Blood ketones (most accurate):</Text> Use a blood ketone meter with ketone test strips. Range: 0.5-3.0 mmol/L indicates nutritional ketosis.
              </Text>
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                <Text style={[styles.helpBold, { color: theme.colors.text }]}>Alternatives:</Text> Breath meters (less accurate) or urine strips (cheapest but unreliable for long-term keto).
              </Text>
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                <Text style={[styles.helpBold, { color: theme.colors.text }]}>Keto target:</Text> 1.0-3.0 mmol/L is optimal for therapeutic ketosis. Higher isn't always better.
              </Text>
            </HelpTip>
          </View>

          {ratio !== null && (
            <>
              <View style={[styles.ratioCard, { backgroundColor: theme.colors.card, borderColor: getRatioColor(ratio) }]}>
                <Text style={[styles.ratioLabel, { color: theme.colors.textSecondary }]}>Dr. Boz Ratio</Text>
                <Text style={[styles.ratioValue, { color: getRatioColor(ratio) }]}>
                  {ratio}
                </Text>
                <Text style={[styles.ratioStatus, { color: theme.colors.textSecondary }]}>{getRatioStatus(ratio)}</Text>
              </View>
              <HelpTip title="💡 Understanding the Dr. Boz Ratio" theme={theme}>
                <Text style={[styles.helpText, { color: theme.colors.text }]}>
                  <Text style={[styles.helpBold, { color: theme.colors.text }]}>Formula:</Text> Glucose (mmol/L) ÷ Ketones (mmol/L)
                </Text>
                <Text style={[styles.helpText, { color: theme.colors.text }]}>
                  <Text style={[styles.helpBold, { color: theme.colors.text }]}>What it means:</Text> This ratio indicates how well your metabolism is adapted to burning fat for fuel. Lower ratios = deeper ketosis and more autophagy.
                </Text>
                <Text style={[styles.helpText, { color: theme.colors.text }]}>
                  <Text style={[styles.helpBold, { color: theme.colors.text }]}>Target ranges:</Text>
                  {'\n'}• Under 40: Excellent - maximum healing and autophagy
                  {'\n'}• 40-80: Good - therapeutic ketosis
                  {'\n'}• 80-100: Fair - light ketosis, room for improvement
                  {'\n'}• Over 100: Not in therapeutic ketosis yet
                </Text>
                <Text style={[styles.helpText, { color: theme.colors.text }]}>
                  <Text style={[styles.helpBold, { color: theme.colors.text }]}>Example:</Text> Glucose 4.5 ÷ Ketones 1.5 = Ratio of 30 (Excellent!)
                </Text>
              </HelpTip>
            </>
          )}
        </View>

        {/* Optional Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Optional</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Weight (lbs)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={weight}
              onChangeText={(text) => validateNumber(text, setWeight, 999)}
              keyboardType="decimal-pad"
              placeholder="e.g. 180"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Energy Level (1-10)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={energy}
              onChangeText={(text) => validateNumber(text, setEnergy, 10)}
              keyboardType="number-pad"
              placeholder="e.g. 8"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <HelpTip title="💡 Tracking energy levels" theme={theme}>
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                <Text style={[styles.helpBold, { color: theme.colors.text }]}>Scale:</Text> 1 = Exhausted, can barely function; 10 = Peak energy, unstoppable
              </Text>
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                <Text style={[styles.helpBold, { color: theme.colors.text }]}>When to assess:</Text> Mid-afternoon (2-4 PM) when energy typically dips
              </Text>
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                <Text style={[styles.helpBold, { color: theme.colors.text }]}>What to look for:</Text> As you progress through ketosis, you should notice sustained energy without crashes, especially after the initial "keto flu" adaptation period.
              </Text>
            </HelpTip>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Mental Clarity (1-10)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={clarity}
              onChangeText={(text) => validateNumber(text, setClarity, 10)}
              keyboardType="number-pad"
              placeholder="e.g. 9"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <HelpTip title="💡 Tracking mental clarity" theme={theme}>
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                <Text style={[styles.helpBold, { color: theme.colors.text }]}>Scale:</Text> 1 = Brain fog, can't focus; 10 = Crystal clear thinking, laser focus
              </Text>
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                <Text style={[styles.helpBold, { color: theme.colors.text }]}>When to assess:</Text> During your most mentally demanding tasks (work, study, problem-solving)
              </Text>
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                <Text style={[styles.helpBold, { color: theme.colors.text }]}>What to look for:</Text> Many people report enhanced mental clarity and focus as a major benefit of ketosis. Ketones provide stable brain fuel without glucose spikes/crashes.
              </Text>
            </HelpTip>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton, 
            { backgroundColor: theme.colors.accent },
            saving && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving 
              ? (isEditing ? 'Updating...' : 'Saving...') 
              : (isEditing ? 'Update Entry' : 'Save Metrics')}
          </Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
  },
  ratioCard: {
    borderWidth: 3,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  ratioLabel: {
    fontSize: 14,
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
    fontWeight: '600',
  },
  saveButton: {
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
    borderRadius: 8,
    borderLeftWidth: 3,
    overflow: 'hidden',
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  helpIcon: {
    fontSize: 12,
    marginRight: 8,
    fontWeight: 'bold',
  },
  helpTitle: {
    fontSize: 14,
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
    lineHeight: 20,
    marginBottom: 8,
  },
  helpBold: {
    fontWeight: '700',
  },
});
