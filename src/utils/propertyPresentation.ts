import {addDaysToIsoDate} from './bookingCalendar';
import {normalizeDateString} from './dateInput';

const formatDateLabel = (value: string) => {
  const normalizedValue = normalizeDateString(value);

  if (!normalizedValue) {
    return value;
  }

  const parsed = new Date(`${normalizedValue}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

const formatMoneyValue = (value: number) => {
  const fixed = value.toFixed(2);
  const [wholePart, decimalPart] = fixed.split('.');
  const wholeWithCommas = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return decimalPart === '00'
    ? wholeWithCommas
    : `${wholeWithCommas}.${decimalPart}`;
};

export const getLatestPropertyCheckInDate = (availableTo: string | null) => {
  const normalizedAvailableTo = normalizeDateString(availableTo);

  if (!normalizedAvailableTo) {
    return null;
  }

  return addDaysToIsoDate(normalizedAvailableTo, -1);
};

export const hasPropertyBookableStayDates = (
  availableFrom: string | null,
  availableTo: string | null,
  referenceDate: string,
) => {
  const normalizedReferenceDate = normalizeDateString(referenceDate);

  if (!normalizedReferenceDate) {
    return true;
  }

  const normalizedAvailableFrom = normalizeDateString(availableFrom);
  const latestCheckInDate = getLatestPropertyCheckInDate(availableTo);

  if (!latestCheckInDate) {
    return true;
  }

  const firstBookableCheckInDate =
    normalizedAvailableFrom && normalizedAvailableFrom > normalizedReferenceDate
      ? normalizedAvailableFrom
      : normalizedReferenceDate;

  return firstBookableCheckInDate <= latestCheckInDate;
};

export const formatPropertyRent = (monthlyRent: number | null) =>
  monthlyRent === null
    ? 'Rent not added yet'
    : `LKR ${formatMoneyValue(monthlyRent)} per month`;

export const formatPropertyRentCompact = (monthlyRent: number | null) =>
  monthlyRent === null
    ? 'Rent not added yet'
    : `LKR ${formatMoneyValue(monthlyRent)}/month`;

export const formatPropertyAvailabilityChip = (
  availableFrom: string | null,
  availableTo: string | null,
  fallbackLabel: string,
) => {
  if (availableFrom) {
    return `Available ${formatDateLabel(availableFrom)}`;
  }

  if (availableTo) {
    return `Until ${formatDateLabel(availableTo)}`;
  }

  return fallbackLabel;
};

export const formatPropertyAvailability = (
  availableFrom: string | null,
  availableTo: string | null,
) => {
  if (availableFrom && availableTo) {
    return `${formatDateLabel(availableFrom)} - ${formatDateLabel(availableTo)}`;
  }

  if (availableFrom) {
    return `From ${formatDateLabel(availableFrom)}`;
  }

  if (availableTo) {
    return `Until ${formatDateLabel(availableTo)}`;
  }

  return 'Availability not added yet';
};
