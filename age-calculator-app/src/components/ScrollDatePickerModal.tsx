import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';
import { formatDate, getCalendarDays, MONTHS, WEEKDAYS } from '../utils/date';

type DatePickerModalProps = {
  selectedDate: Date | null;
  maximumDate: Date;
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
};

export function ScrollDatePickerModal({
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
  const [selector, setSelector] = useState<'calendar' | 'month' | 'year'>('calendar');

  useEffect(() => {
    if (!visible) return;

    const date = selectedDate ?? maximumDate;
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setSelector('calendar');
  }, [maximumDateTime, selectedDateTime, visible]);

  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const isCurrentMonth =
    visibleMonth.getFullYear() === maximumDate.getFullYear() &&
    visibleMonth.getMonth() === maximumDate.getMonth();

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(
      visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1,
    );
    const maximumMonth = new Date(maximumDate.getFullYear(), maximumDate.getMonth(), 1);
    if (nextMonth <= maximumMonth) setVisibleMonth(nextMonth);
  };

  const selectDay = (day: number) => {
    const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    if (date <= maximumDate) onSelect(date);
  };

  const selectMonth = (month: number) => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), month, 1));
    setSelector('calendar');
  };

  const selectYear = (year: number) => {
    const month = year === maximumDate.getFullYear()
      ? Math.min(visibleMonth.getMonth(), maximumDate.getMonth())
      : visibleMonth.getMonth();
    setVisibleMonth(new Date(year, month, 1));
    setSelector('calendar');
  };

  const openYearSelector = () => {
    setSelector(selector === 'year' ? 'calendar' : 'year');
  };

  const renderMonthSelector = () => (
    <View>
      <Text style={styles.scrollHint}>Scroll to choose a month</Text>
      <ScrollView
        accessibilityLabel="Month list"
        contentContainerStyle={styles.yearListContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator
        style={styles.yearList}
      >
        {MONTHS.map((month, index) => {
          const disabled = visibleMonth.getFullYear() === maximumDate.getFullYear()
            && index > maximumDate.getMonth();
          const selected = index === visibleMonth.getMonth();
          return (
            <OptionButton
              disabled={disabled}
              fullWidth
              key={month}
              label={month}
              onPress={() => selectMonth(index)}
              selected={selected}
            />
          );
        })}
      </ScrollView>
    </View>
  );

  const renderYearSelector = () => (
    <View>
      <Text style={styles.scrollHint}>Scroll to choose a year</Text>
      <ScrollView
        accessibilityLabel="Year list"
        contentContainerStyle={styles.yearListContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator
        style={styles.yearList}
      >
        {Array.from(
          { length: 200 },
          (_, index) => maximumDate.getFullYear() - index,
        ).map((year) => (
          <OptionButton
            fullWidth
            key={year}
            label={String(year)}
            onPress={() => selectYear(year)}
            selected={year === visibleMonth.getFullYear()}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderCalendar = () => (
    <>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((weekday) => (
          <Text key={weekday} style={styles.weekday}>{weekday}</Text>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {calendarDays.map((day, index) => {
          if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;

          const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
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
    </>
  );

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
            <View style={styles.dateSelectors}>
              <SelectorButton
                label={MONTHS[visibleMonth.getMonth()]}
                onPress={() => setSelector(selector === 'month' ? 'calendar' : 'month')}
                accessibilityLabel="Choose month"
              />
              <SelectorButton
                label={String(visibleMonth.getFullYear())}
                onPress={openYearSelector}
                accessibilityLabel="Choose year"
              />
            </View>
            <MonthButton
              disabled={isCurrentMonth}
              label="Next month"
              symbol="›"
              onPress={() => changeMonth(1)}
            />
          </View>

          {selector === 'month'
            ? renderMonthSelector()
            : selector === 'year'
              ? renderYearSelector()
              : renderCalendar()}

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

type ButtonProps = {
  label: string;
  disabled?: boolean;
  fullWidth?: boolean;
  selected?: boolean;
  onPress: () => void;
};

function SelectorButton({ label, accessibilityLabel, onPress }: ButtonProps & { accessibilityLabel: string }) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.selectorButton, pressed && styles.pressed]}
    >
      <Text style={styles.monthTitle}>{label}</Text>
      <Text style={styles.selectorChevron}>⌄</Text>
    </Pressable>
  );
}

function OptionButton({
  label,
  disabled = false,
  fullWidth = false,
  selected = false,
  onPress,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionButton,
        fullWidth && styles.fullWidthOption,
        selected && styles.selectedOption,
        disabled && styles.disabledOption,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.optionText, selected && styles.selectedOptionText]}>{label}</Text>
    </Pressable>
  );
}

function MonthButton({
  label,
  symbol,
  disabled = false,
  onPress,
}: ButtonProps & { symbol: string }) {
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
  dateSelectors: { alignItems: 'center', flexDirection: 'row', gap: 2 },
  selectorButton: {
    alignItems: 'center', borderRadius: 8, flexDirection: 'row', gap: 3,
    paddingHorizontal: 6, paddingVertical: 7,
  },
  selectorChevron: { color: COLORS.primary, fontSize: 15, fontWeight: '800' },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 6 },
  optionButton: {
    alignItems: 'center', borderRadius: 10, justifyContent: 'center',
    margin: '1.6667%', minHeight: 48, width: '30%',
  },
  fullWidthOption: { marginHorizontal: 0, marginVertical: 2, width: '100%' },
  selectedOption: { backgroundColor: COLORS.primary },
  disabledOption: { opacity: 0.3 },
  optionText: { color: COLORS.ink, fontSize: 15, fontWeight: '700' },
  selectedOptionText: { color: '#FFFFFF' },
  scrollHint: {
    color: COLORS.muted, fontSize: 13, fontWeight: '600', marginBottom: 6,
    textAlign: 'center',
  },
  yearList: { maxHeight: 270 },
  yearListContent: { paddingVertical: 2 },
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
