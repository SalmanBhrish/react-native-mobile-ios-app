const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateOfBirth(value) {
  if (typeof value !== 'string') {
    return { error: 'dateOfBirth is required and must be a string in YYYY-MM-DD format.' };
  }

  const match = DATE_PATTERN.exec(value);
  if (!match) {
    return { error: 'dateOfBirth must use YYYY-MM-DD format.' };
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return { error: 'dateOfBirth must be a valid calendar date.' };
  }

  return { date };
}

function shiftDate(date, years, months) {
  const sourceMonth = date.getUTCMonth();
  const totalMonth = sourceMonth + months;
  const targetYear = date.getUTCFullYear() + years + Math.floor(totalMonth / 12);
  const targetMonth = ((totalMonth % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();

  return new Date(
    Date.UTC(targetYear, targetMonth, Math.min(date.getUTCDate(), lastDay)),
  );
}

export function calculateAge(dateOfBirth, currentDate) {
  let years = currentDate.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  if (shiftDate(dateOfBirth, years, 0) > currentDate) years -= 1;

  let months = 0;
  while (months < 11 && shiftDate(dateOfBirth, years, months + 1) <= currentDate) {
    months += 1;
  }

  const monthAnchor = shiftDate(dateOfBirth, years, months);
  const days = Math.floor((currentDate - monthAnchor) / 86_400_000);

  return { years, months, days };
}

export function utcToday(now = new Date()) {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}
