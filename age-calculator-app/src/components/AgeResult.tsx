import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';
import { formatDate } from '../utils/date';
import type { Age } from '../utils/date';

type AgeResultProps = {
  age: Age;
  calculatedAt: Date;
};

export function AgeResult({ age, calculatedAt }: AgeResultProps) {
  const values = [
    { value: age.years, label: 'Years' },
    { value: age.months, label: 'Months' },
    { value: age.days, label: 'Days' },
  ];

  return (
    <View accessibilityLiveRegion="polite" style={styles.card}>
      <Text style={styles.eyebrow}>YOUR AGE IS</Text>
      <View style={styles.row}>
        {values.map((item, index) => (
          <View key={item.label} style={styles.item}>
            {index > 0 && <View style={styles.divider} />}
            <Text style={styles.number}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.asOf}>Calculated as of {formatDate(calculatedAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center', backgroundColor: COLORS.ink, borderRadius: 20,
    marginTop: 18, paddingHorizontal: 12, paddingVertical: 22,
  },
  eyebrow: {
    color: '#BFC5D4', fontSize: 11, fontWeight: '800', letterSpacing: 1.4,
    marginBottom: 18,
  },
  row: { flexDirection: 'row', width: '100%' },
  item: { alignItems: 'center', flex: 1, position: 'relative' },
  divider: {
    backgroundColor: '#394056', bottom: 3, left: 0, position: 'absolute',
    top: 3, width: 1,
  },
  number: { color: '#FFFFFF', fontSize: 32, fontWeight: '800' },
  label: { color: '#BFC5D4', fontSize: 13, marginTop: 2 },
  asOf: { color: '#8F97AA', fontSize: 12, marginTop: 18 },
});
