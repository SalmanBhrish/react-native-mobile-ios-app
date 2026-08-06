export type Age = {
  years: number;
  months: number;
  days: number;
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const shiftDate = (date: Date, years: number, months: number) => {
  const targetMonth = date.getMonth() + months;
  const targetYear = date.getFullYear() + years + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();

  return new Date(targetYear, normalizedMonth, Math.min(date.getDate(), lastDay));
};

export const calculateAge = (birthDate: Date, currentDate: Date): Age => {
  let years = currentDate.getFullYear() - birthDate.getFullYear();
  if (shiftDate(birthDate, years, 0) > currentDate) years -= 1;

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

export const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const getCalendarDays = (monthDate: Date): Array<number | null> => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const emptyDays = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return [
    ...Array.from({ length: emptyDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
};
