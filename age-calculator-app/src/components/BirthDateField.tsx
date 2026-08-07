import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../theme';
import { formatDate } from '../utils/date';
import { CalendarIcon } from './CalendarIcon';

type BirthDateFieldProps = {
  birthDate: Date | null;
  hasError: boolean;
  onPress: () => void;
};

export function BirthDateField({ birthDate, hasError, onPress }: BirthDateFieldProps) {
  return (
    <Pressable
      accessibilityHint="Opens a calendar"
      accessibilityLabel="Select date of birth"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.field,
        hasError && styles.fieldError,
        pressed && styles.pressed,
      ]}
    >
      <CalendarIcon />
      <Text style={[styles.dateText, !birthDate && styles.placeholderText]}>
        {birthDate ? formatDate(birthDate) : 'Select your date of birth'}
      </Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: 16,
  },
  fieldError: { borderColor: COLORS.error },
  dateText: { color: COLORS.ink, flex: 1, fontSize: 16, fontWeight: '600' },
  placeholderText: { color: '#8C94A6', fontWeight: '400' },
  chevron: { color: COLORS.muted, fontSize: 28, lineHeight: 28 },
  pressed: { opacity: 0.7 },
});
