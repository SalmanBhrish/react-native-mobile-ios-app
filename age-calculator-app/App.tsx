import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Age = {
  years: number;
  months: number;
  days: number;
};

const COLORS = {
  background: '#F6F7FB',
  card: '#FFFFFF',
  ink: '#192033',
  muted: '#697386',
  primary: '#635BFF',
  primarySoft: '#EEEDFF',
  border: '#E2E6EF',
  error: '#C9362B',
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const shiftDate = (date: Date, years: number, months: number) => {
  const targetMonth = date.getMonth() + months;
  const targetYear = date.getFullYear() + years + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDayOfMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();

  return new Date(
    targetYear,
    normalizedMonth,
    Math.min(date.getDate(), lastDayOfMonth),
  );
};

const calculateAge = (birthDate: Date, currentDate: Date): Age => {
  let years = currentDate.getFullYear() - birthDate.getFullYear();
  if (shiftDate(birthDate, years, 0) > currentDate) {
    years -= 1;
  }

  let months = 0;
  while (months < 11 && shiftDate(birthDate, years, months + 1) <= currentDate) {
    months += 1;
  }

  const monthAnchor = shiftDate(birthDate, years, months);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const days = Math.round(
    (currentDate.getTime() - monthAnchor.getTime()) / millisecondsPerDay,
  );

  return { years, months, days };
};

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function App() {
  const today = startOfDay(new Date());
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [age, setAge] = useState<Age | null>(null);
  const [error, setError] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [visibleMonth]);

  const isCurrentMonth =
    visibleMonth.getFullYear() === today.getFullYear() &&
    visibleMonth.getMonth() === today.getMonth();

  const openPicker = () => {
    const initialDate = birthDate ?? today;
    setVisibleMonth(
      new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
    );
    setPickerVisible(true);
  };

  const selectDay = (day: number) => {
    const selectedDate = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      day,
    );

    if (selectedDate > today) return;

    setBirthDate(selectedDate);
    setAge(null);
    setError('');
    setPickerVisible(false);
  };

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + offset,
      1,
    );
    if (nextMonth <= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setVisibleMonth(nextMonth);
    }
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
              onPress={openPicker}
              style={({ pressed }) => [
                styles.dateField,
                error ? styles.dateFieldError : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={styles.calendarIcon}>
                <View style={styles.calendarRings} />
                <View style={styles.calendarLine} />
              </View>
              <Text
                style={[styles.dateText, !birthDate && styles.placeholderText]}
              >
                {birthDate ? formatDate(birthDate) : 'Select your date of birth'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>

            {!!error && (
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                {error}
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={handleCalculate}
              style={({ pressed }) => [
                styles.calculateButton,
                pressed ? styles.buttonPressed : null,
              ]}
            >
              <Text style={styles.calculateButtonText}>Calculate age</Text>
            </Pressable>
          </View>

          {age && (
            <View accessibilityLiveRegion="polite" style={styles.resultCard}>
              <Text style={styles.resultEyebrow}>YOUR AGE IS</Text>
              <View style={styles.resultRow}>
                {[
                  { value: age.years, label: 'Years' },
                  { value: age.months, label: 'Months' },
                  { value: age.days, label: 'Days' },
                ].map((item, index) => (
                  <View key={item.label} style={styles.resultItem}>
                    {index > 0 && <View style={styles.resultDivider} />}
                    <Text style={styles.resultNumber}>{item.value}</Text>
                    <Text style={styles.resultLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.asOfText}>Calculated as of {formatDate(today)}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
        statusBarTranslucent
        transparent
        visible={pickerVisible}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityLabel="Close date picker"
            onPress={() => setPickerVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View accessibilityViewIsModal style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Pressable
                accessibilityLabel="Previous month"
                hitSlop={8}
                onPress={() => changeMonth(-1)}
                style={({ pressed }) => [
                  styles.monthButton,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={styles.monthButtonText}>‹</Text>
              </Pressable>
              <Text style={styles.monthTitle}>
                {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
              </Text>
              <Pressable
                accessibilityLabel="Next month"
                disabled={isCurrentMonth}
                hitSlop={8}
                onPress={() => changeMonth(1)}
                style={({ pressed }) => [
                  styles.monthButton,
                  isCurrentMonth && styles.monthButtonDisabled,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={styles.monthButtonText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((weekday) => (
                <Text key={weekday} style={styles.weekday}>
                  {weekday}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarDays.map((day, index) => {
                if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;

                const date = new Date(
                  visibleMonth.getFullYear(),
                  visibleMonth.getMonth(),
                  day,
                );
                const disabled = date > today;
                const selected = birthDate?.getTime() === date.getTime();

                return (
                  <View key={day} style={styles.dayCell}>
                    <Pressable
                      accessibilityLabel={formatDate(date)}
                      accessibilityRole="button"
                      accessibilityState={{ disabled, selected }}
                      disabled={disabled}
                      onPress={() => selectDay(day)}
                      style={({ pressed }) => [
                        styles.dayButton,
                        selected && styles.selectedDay,
                        pressed && !disabled ? styles.pressed : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          disabled && styles.disabledDayText,
                          selected && styles.selectedDayText,
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setPickerVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? NativeStatusBar.currentHeight : 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  content: {
    alignSelf: 'center',
    maxWidth: 520,
    width: '100%',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: COLORS.ink,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 43,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
    marginTop: 8,
  },
  card: {
    backgroundColor: COLORS.card,
    borderColor: '#ECEEF4',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#27304A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  label: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 9,
  },
  dateField: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: 16,
  },
  dateFieldError: {
    borderColor: COLORS.error,
  },
  calendarIcon: {
    borderColor: COLORS.primary,
    borderRadius: 3,
    borderWidth: 1.7,
    height: 18,
    marginRight: 12,
    width: 18,
  },
  calendarRings: {
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 1.7,
    borderRightColor: COLORS.primary,
    borderRightWidth: 1.7,
    height: 5,
    left: 3,
    position: 'absolute',
    top: -4,
    width: 9,
  },
  calendarLine: {
    backgroundColor: COLORS.primary,
    height: 1.5,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 4,
  },
  dateText: {
    color: COLORS.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    color: '#8C94A6',
    fontWeight: '400',
  },
  chevron: {
    color: COLORS.muted,
    fontSize: 28,
    lineHeight: 28,
  },
  pressed: {
    opacity: 0.7,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  calculateButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 56,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  resultCard: {
    alignItems: 'center',
    backgroundColor: COLORS.ink,
    borderRadius: 20,
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 22,
  },
  resultEyebrow: {
    color: '#BFC5D4',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 18,
  },
  resultRow: {
    flexDirection: 'row',
    width: '100%',
  },
  resultItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  resultDivider: {
    backgroundColor: '#394056',
    bottom: 3,
    left: 0,
    position: 'absolute',
    top: 3,
    width: 1,
  },
  resultNumber: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  resultLabel: {
    color: '#BFC5D4',
    fontSize: 13,
    marginTop: 2,
  },
  asOfText: {
    color: '#8F97AA',
    fontSize: 12,
    marginTop: 18,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 23, 39, 0.56)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  calendarModal: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    maxWidth: 420,
    padding: 18,
    width: '100%',
  },
  calendarHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  monthButtonDisabled: {
    opacity: 0.35,
  },
  monthButtonText: {
    color: COLORS.primary,
    fontSize: 30,
    lineHeight: 32,
  },
  monthTitle: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekday: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    alignItems: 'center',
    aspectRatio: 1,
    justifyContent: 'center',
    width: '14.2857%',
  },
  dayButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: '86%',
    justifyContent: 'center',
    width: '86%',
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  disabledDayText: {
    color: '#C5CAD4',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  cancelButton: {
    alignItems: 'center',
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 16,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
