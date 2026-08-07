import { useState } from 'react';
import { calculateAge, startOfDay } from '../utils/date';
import type { Age } from '../utils/date';

export function useAgeCalculator() {
  const today = startOfDay(new Date());
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [age, setAge] = useState<Age | null>(null);
  const [error, setError] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  const openPicker = () => setPickerVisible(true);
  const closePicker = () => setPickerVisible(false);

  const selectBirthDate = (date: Date) => {
    setBirthDate(date);
    setAge(null);
    setError('');
    closePicker();
  };

  const calculate = () => {
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

  return {
    age,
    birthDate,
    calculate,
    closePicker,
    error,
    openPicker,
    pickerVisible,
    selectBirthDate,
    today,
  };
}
