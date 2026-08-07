import { StyleSheet, View } from 'react-native';
import { COLORS } from '../theme';

export function CalendarIcon() {
  return (
    <View style={styles.icon}>
      <View style={styles.rings} />
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    borderColor: COLORS.primary,
    borderRadius: 3,
    borderWidth: 1.7,
    height: 18,
    marginRight: 12,
    width: 18,
  },
  rings: {
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
  line: {
    backgroundColor: COLORS.primary,
    height: 1.5,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 4,
  },
});
