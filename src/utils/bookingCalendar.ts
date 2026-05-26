import {normalizeDateString} from './dateInput';

export const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const createUtcDate = (value: string) => {
  const normalizedValue = normalizeDateString(value);

  if (!normalizedValue) {
    return null;
  }

  const parsedDate = new Date(`${normalizedValue}T00:00:00Z`);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const formatCalendarDate = (
  year: number,
  monthIndex: number,
  day: number,
) =>
  `${String(year).padStart(4, '0')}-${String(monthIndex + 1).padStart(
    2,
    '0',
  )}-${String(day).padStart(2, '0')}`;

export const parseCalendarDate = (value: string) => {
  const normalizedValue = normalizeDateString(value);

  if (!normalizedValue) {
    return null;
  }

  const [yearString, monthString, dayString] = normalizedValue.split('-');

  return {
    day: Number(dayString),
    monthIndex: Number(monthString) - 1,
    value: normalizedValue,
    year: Number(yearString),
  };
};

export const getDaysInMonth = (year: number, monthIndex: number) =>
  new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

export const buildCalendarGrid = (year: number, monthIndex: number) => {
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const totalDays = getDaysInMonth(year, monthIndex);
  const leadingSlots = Array.from({length: firstWeekday}, () => null);
  const daySlots = Array.from({length: totalDays}, (_, index) => index + 1);
  const trailingCount =
    (7 - ((leadingSlots.length + daySlots.length) % 7)) % 7;
  const trailingSlots = Array.from({length: trailingCount}, () => null);

  return [...leadingSlots, ...daySlots, ...trailingSlots];
};

export const getTodayIsoDate = () => {
  const currentDate = new Date();

  return formatCalendarDate(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate(),
  );
};

export const addDaysToIsoDate = (value: string, days: number) => {
  const parsedDate = createUtcDate(value);

  if (!parsedDate || !Number.isInteger(days)) {
    return null;
  }

  parsedDate.setUTCDate(parsedDate.getUTCDate() + days);

  return formatCalendarDate(
    parsedDate.getUTCFullYear(),
    parsedDate.getUTCMonth(),
    parsedDate.getUTCDate(),
  );
};

export const getLaterIsoDate = (firstValue: string, secondValue: string) =>
  firstValue >= secondValue ? firstValue : secondValue;

export const getStartOfMonthIsoDate = (year: number, monthIndex: number) =>
  formatCalendarDate(year, monthIndex, 1);

export const getEndOfMonthIsoDate = (year: number, monthIndex: number) =>
  formatCalendarDate(year, monthIndex, getDaysInMonth(year, monthIndex));

export const iterateStayDates = (checkIn: string, checkOut: string) => {
  const normalizedCheckIn = normalizeDateString(checkIn);
  const normalizedCheckOut = normalizeDateString(checkOut);

  if (
    !normalizedCheckIn ||
    !normalizedCheckOut ||
    normalizedCheckOut <= normalizedCheckIn
  ) {
    return [];
  }

  const dates: string[] = [];
  let currentDate = normalizedCheckIn;

  while (currentDate < normalizedCheckOut) {
    dates.push(currentDate);

    const nextDate = addDaysToIsoDate(currentDate, 1);

    if (!nextDate) {
      break;
    }

    currentDate = nextDate;
  }

  return dates;
};

export const doesDateRangeIntersectBlockedDates = (
  checkIn: string,
  checkOut: string,
  blockedDates: Set<string>,
) =>
  iterateStayDates(checkIn, checkOut).some(date => blockedDates.has(date));

export const isDateWithinBookingRange = (
  value: string,
  checkIn: string,
  checkOut: string,
) => {
  const normalizedValue = normalizeDateString(value);
  const normalizedCheckIn = normalizeDateString(checkIn);
  const normalizedCheckOut = normalizeDateString(checkOut);

  if (!normalizedValue || !normalizedCheckIn || !normalizedCheckOut) {
    return false;
  }

  return (
    normalizedValue >= normalizedCheckIn &&
    normalizedValue < normalizedCheckOut
  );
};

export const buildVisibleMonthEntries = (
  year: number,
  monthIndex: number,
  radius = 4,
) =>
  Array.from({length: radius * 2 + 1}, (_, index) => {
    const offset = index - radius;
    const monthDate = new Date(Date.UTC(year, monthIndex + offset, 1));

    return {
      key: `${monthDate.getUTCFullYear()}-${String(
        monthDate.getUTCMonth() + 1,
      ).padStart(2, '0')}`,
      label: monthLabels[monthDate.getUTCMonth()],
      monthIndex: monthDate.getUTCMonth(),
      year: monthDate.getUTCFullYear(),
    };
  });
