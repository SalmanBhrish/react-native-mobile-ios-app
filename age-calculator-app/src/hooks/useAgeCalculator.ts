import { useState } from 'react';
import { calculateAgeFromApi } from '../services/ageApi';
import { startOfDay } from '../utils/date';
import type { Age } from '../utils/date';

export function useAgeCalculator() {
  const today = startOfDay(new Date());
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [age, setAge] = useState<Age | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const openPicker = () => setPickerVisible(true);
  const closePicker = () => setPickerVisible(false);

  const selectBirthDate = (date: Date) => {
    setBirthDate(date);
    setAge(null);
    setError('');
    closePicker();
  };

  const calculate = async () => {
    if (!birthDate) {
      setAge(null);
      setError('Please select your date of birth.');
      return;
    }

    setError('');
    setAge(null);
    setIsLoading(true);

    try {
      setAge(await calculateAgeFromApi(birthDate));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to calculate age.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}
