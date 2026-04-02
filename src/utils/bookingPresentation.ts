import {normalizeDateString} from './dateInput';

const formatMoneyValue = (value: number) => {
  const fixedValue = value.toFixed(2);
  const [wholePart, decimalPart] = fixedValue.split('.');
  const wholeWithCommas = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return decimalPart === '00'
    ? wholeWithCommas
    : `${wholeWithCommas}.${decimalPart}`;
};

export const formatBookingDateLabel = (value?: string | null) => {
  const normalizedValue = normalizeDateString(value);

  if (!normalizedValue) {
    return value ? String(value) : 'Unknown date';
  }

  const parsedDate = new Date(`${normalizedValue}T00:00:00Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return normalizedValue;
  }

  return parsedDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  });
};

export const formatBookingRange = (
  checkIn?: string | null,
  checkOut?: string | null,
) => {
  const normalizedCheckIn = normalizeDateString(checkIn);
  const normalizedCheckOut = normalizeDateString(checkOut);

  if (!normalizedCheckIn && !normalizedCheckOut) {
    return 'Stay dates not added yet';
  }

  if (normalizedCheckIn && normalizedCheckOut) {
    return `${formatBookingDateLabel(normalizedCheckIn)} - ${formatBookingDateLabel(
      normalizedCheckOut,
    )}`;
  }

  if (normalizedCheckIn) {
    return `From ${formatBookingDateLabel(normalizedCheckIn)}`;
  }

  return `Until ${formatBookingDateLabel(normalizedCheckOut)}`;
};

export const formatBookingMoney = (value: number | null) =>
  value === null ? 'Rent pending' : `LKR ${formatMoneyValue(value)}`;

export const formatBookingStatusLabel = (value?: string | null) => {
  const normalizedValue = String(value ?? 'pending')
    .trim()
    .toLowerCase();

  if (!normalizedValue) {
    return 'Pending';
  }

  return normalizedValue
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};
