import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AgeResult } from './src/components/AgeResult';
import { ScrollDatePickerModal } from './src/components/ScrollDatePickerModal';
import { COLORS } from './src/theme';
import { calculateAge, formatDate, startOfDay } from './src/utils/date';
import type { Age } from './src/utils/date';

export default function App() {
  const today = startOfDay(new Date());
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [age, setAge] = useState<Age | null>(null);
  const [error, setError] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleDateSelect = (date: Date) => {
    setBirthDate(date);
    setAge(null);
    setError('');
    setPickerVisible(false);
  };

  const handleCalculate = () => {
    if (!birthDate) {
      setAge(null);
      setError('Please select your date of birth.');
      return;
    }

    if (birthDate > today) {
      setAge(null);
      setError('Date of birth cannot be in the future.');
      return;
    }

    setError('');
    setAge(calculateAge(birthDate, today));
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AGE CALCULATOR</Text>
          </View>
          <Text style={styles.title}>How old are you?</Text>
          <Text style={styles.subtitle}>
            Choose your date of birth to see your exact age today.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Date of birth</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select date of birth"
              accessibilityHint="Opens a calendar"
              onPress={() => setPickerVisible(true)}
              style={({ pressed }) => [
                styles.dateField,
                !!error && styles.dateFieldError,
                pressed && styles.pressed,
              ]}
            >
              <CalendarIcon />
              <Text style={[styles.dateText, !birthDate && styles.placeholderText]}>
                {birthDate ? formatDate(birthDate) : 'Select your date of birth'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>

            {!!error && (
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={handleCalculate}
              style={({ pressed }) => [styles.calculateButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.calculateButtonText}>Calculate age</Text>
            </Pressable>
          </View>

          {age && <AgeResult age={age} calculatedAt={today} />}
        </View>
      </ScrollView>

      <ScrollDatePickerModal
        maximumDate={today}
        onClose={() => setPickerVisible(false)}
        onSelect={handleDateSelect}
        selectedDate={birthDate}
        visible={pickerVisible}
      />
    </View>
  );
}

function CalendarIcon() {
  return (
    <View style={styles.calendarIcon}>
      <View style={styles.calendarRings} />
      <View style={styles.calendarLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1, backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? NativeStatusBar.currentHeight : 0,
  },
  scrollContent: {
    flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 32,
  },
  content: { alignSelf: 'center', maxWidth: 520, width: '100%' },
  badge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.primarySoft, borderRadius: 999,
    marginBottom: 16, paddingHorizontal: 12, paddingVertical: 7,
  },
  badgeText: {
    color: COLORS.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.2,
  },
  title: {
    color: COLORS.ink, fontSize: 36, fontWeight: '800', letterSpacing: -1, lineHeight: 43,
  },
  subtitle: {
    color: COLORS.muted, fontSize: 16, lineHeight: 24, marginBottom: 28, marginTop: 8,
  },
  card: {
    backgroundColor: COLORS.card, borderColor: '#ECEEF4', borderRadius: 20,
    borderWidth: 1, elevation: 3, padding: 20, shadowColor: '#27304A',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20,
  },
  label: { color: COLORS.ink, fontSize: 14, fontWeight: '700', marginBottom: 9 },
  dateField: {
    alignItems: 'center', borderColor: COLORS.border, borderRadius: 12,
    borderWidth: 1.5, flexDirection: 'row', minHeight: 58, paddingHorizontal: 16,
  },
  dateFieldError: { borderColor: COLORS.error },
  calendarIcon: {
    borderColor: COLORS.primary, borderRadius: 3, borderWidth: 1.7,
    height: 18, marginRight: 12, width: 18,
  },
  calendarRings: {
    borderLeftColor: COLORS.primary, borderLeftWidth: 1.7,
    borderRightColor: COLORS.primary, borderRightWidth: 1.7,
    height: 5, left: 3, position: 'absolute', top: -4, width: 9,
  },
  calendarLine: {
    backgroundColor: COLORS.primary, height: 1.5, left: 0,
    position: 'absolute', right: 0, top: 4,
  },
  dateText: { color: COLORS.ink, flex: 1, fontSize: 16, fontWeight: '600' },
  placeholderText: { color: '#8C94A6', fontWeight: '400' },
  chevron: { color: COLORS.muted, fontSize: 28, lineHeight: 28 },
  pressed: { opacity: 0.7 },
  errorText: {
    color: COLORS.error, fontSize: 13, fontWeight: '600', marginTop: 8,
  },
  calculateButton: {
    alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 12,
    elevation: 3, justifyContent: 'center', marginTop: 20, minHeight: 56,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22, shadowRadius: 12,
  },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  calculateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
