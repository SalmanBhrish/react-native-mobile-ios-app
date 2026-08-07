import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AgeResult } from '../components/AgeResult';
import { BirthDateField } from '../components/BirthDateField';
import { ScrollDatePickerModal } from '../components/ScrollDatePickerModal';
import { useAgeCalculator } from '../hooks/useAgeCalculator';
import { COLORS } from '../theme';

export function AgeCalculatorScreen() {
  const {
    age,
    birthDate,
    calculate,
    closePicker,
    error,
    isLoading,
    openPicker,
    pickerVisible,
    selectBirthDate,
    today,
  } = useAgeCalculator();

  return (
    <View style={styles.screen}>
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
            <BirthDateField
              birthDate={birthDate}
              hasError={Boolean(error)}
              onPress={openPicker}
            />

            {Boolean(error) && (
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                {error}
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy: isLoading, disabled: isLoading }}
              disabled={isLoading}
              onPress={calculate}
              style={({ pressed }) => [
                styles.calculateButton,
                isLoading && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.calculateButtonText}>
                {isLoading ? 'Calculating…' : 'Calculate age'}
              </Text>
            </Pressable>
          </View>

          {age && <AgeResult age={age} calculatedAt={today} />}
        </View>
      </ScrollView>

      <ScrollDatePickerModal
        maximumDate={today}
        onClose={closePicker}
        onSelect={selectBirthDate}
        selectedDate={birthDate}
        visible={pickerVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.background,
    flex: 1,
    paddingTop: Platform.OS === 'android' ? NativeStatusBar.currentHeight : 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  content: { alignSelf: 'center', maxWidth: 520, width: '100%' },
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
    elevation: 3,
    padding: 20,
    shadowColor: '#27304A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  label: { color: COLORS.ink, fontSize: 14, fontWeight: '700', marginBottom: 9 },
  errorText: { color: COLORS.error, fontSize: 13, fontWeight: '600', marginTop: 8 },
  calculateButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    elevation: 3,
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 56,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.65 },
  calculateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
