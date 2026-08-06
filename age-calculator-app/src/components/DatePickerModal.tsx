import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';
import { formatDate, getCalendarDays, MONTHS, WEEKDAYS } from '../utils/date';

type DatePickerModalProps = {
  selectedDate: Date | null;
  maximumDate: Date;
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
};

export function DatePickerModal({
  selectedDate,
  maximumDate,
  visible,
  onClose,
  onSelect,
}: DatePickerModalProps) {
  const initialDate = selectedDate ?? maximumDate;
  const maximumDateTime = maximumDate.getTime();
  const selectedDateTime = selectedDate?.getTime();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );

  useEffect(() => {
    if (!visible) return;

    const date = selectedDate ?? maximumDate;
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }, [maximumDateTime, selectedDateTime, visible]);

  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const isCurrentMonth =
    visibleMonth.getFullYear() === maximumDate.getFullYear() &&
    visibleMonth.getMonth() === maximumDate.getMonth();

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(
      visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1,
    );
    const maximumMonth = new Date(
      maximumDate.getFullYear(), maximumDate.getMonth(), 1,
    );
    if (nextMonth <= maximumMonth) setVisibleMonth(nextMonth);
  };

  const selectDay = (day: number) => {
    const date = new Date(
      visibleMonth.getFullYear(), visibleMonth.getMonth(), day,
    );
    if (date <= maximumDate) onSelect(date);
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityLabel="Close date picker"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View accessibilityViewIsModal style={styles.modal}>
          <View style={styles.header}>
            <MonthButton label="Previous month" symbol="‹" onPress={() => changeMonth(-1)} />
            <Text style={styles.monthTitle}>
              {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
            </Text>
            <MonthButton
              disabled={isCurrentMonth}
              label="Next month"
              symbol="›"
              onPress={() => changeMonth(1)}
            />
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((weekday) => (
              <Text key={weekday} style={styles.weekday}>{weekday}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((day, index) => {
              if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;

              const date = new Date(
                visibleMonth.getFullYear(), visibleMonth.getMonth(), day,
              );
              const disabled = date > maximumDate;
              const selected = selectedDate?.getTime() === date.getTime();

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
                      pressed && !disabled && styles.pressed,
                    ]}
                  >
                    <Text style={[
                      styles.dayText,
                      disabled && styles.disabledDayText,
                      selected && styles.selectedDayText,
                    ]}>
                      {day}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

type MonthButtonProps = {
  label: string;
  symbol: string;
  disabled?: boolean;
  onPress: () => void;
};

function MonthButton({ label, symbol, disabled = false, onPress }: MonthButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.monthButton,
        disabled && styles.monthButtonDisabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.monthButtonText}>{symbol}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center', backgroundColor: 'rgba(17, 23, 39, 0.56)', flex: 1,
    justifyContent: 'center', padding: 20,
  },
  modal: {
    backgroundColor: COLORS.card, borderRadius: 20, maxWidth: 420, padding: 18,
    width: '100%',
  },
  header: {
    alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthButton: {
    alignItems: 'center', backgroundColor: COLORS.primarySoft, borderRadius: 10,
    height: 40, justifyContent: 'center', width: 40,
  },
  monthButtonDisabled: { opacity: 0.35 },
  monthButtonText: { color: COLORS.primary, fontSize: 30, lineHeight: 32 },
  monthTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '800' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: {
    color: COLORS.muted, flex: 1, fontSize: 11, fontWeight: '700', textAlign: 'center',
  },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    alignItems: 'center', aspectRatio: 1, justifyContent: 'center', width: '14.2857%',
  },
  dayButton: {
    alignItems: 'center', borderRadius: 999, height: '86%', justifyContent: 'center',
    width: '86%',
  },
  selectedDay: { backgroundColor: COLORS.primary },
  dayText: { color: COLORS.ink, fontSize: 14, fontWeight: '600' },
  disabledDayText: { color: '#C5CAD4' },
  selectedDayText: { color: '#FFFFFF', fontWeight: '800' },
  pressed: { opacity: 0.7 },
  cancelButton: {
    alignItems: 'center', borderTopColor: COLORS.border, borderTopWidth: 1,
    marginTop: 12, paddingTop: 16,
  },
  cancelText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
});
