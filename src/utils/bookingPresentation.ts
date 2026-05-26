import {normalizeDateString} from './dateInput';
import {
  BookingReviewRecord,
  PaymentStatus,
} from '../services/bookings';
import {RentalServiceRequestRecord} from '../types/rentalService';

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

export const formatBookingPaymentStatusLabel = (
  value?: PaymentStatus | string | null,
) => {
  const normalizedValue = String(value ?? '').trim().toLowerCase();

  if (normalizedValue === 'deposit_pending') {
    return 'Deposit Pending';
  }

  if (normalizedValue === 'deposit_paid') {
    return 'Deposit Paid';
  }

  if (normalizedValue === 'paid') {
    return 'Paid in Full';
  }

  if (normalizedValue === 'failed') {
    return 'Payment Failed';
  }

  if (normalizedValue === 'expired') {
    return 'Deposit Expired';
  }

  if (normalizedValue === 'refunded') {
    return 'Refunded';
  }

  return 'Payment Pending';
};

export const formatBookingDateTimeLabel = (value?: string | null) => {
  if (!value) {
    return 'Not recorded';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleString('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatBookingServiceRequestSummary = (
  serviceRequests: RentalServiceRequestRecord[] = [],
) => {
  if (serviceRequests.length === 0) {
    return 'No extra services';
  }

  const categoryNames = Array.from(
    new Set(
      serviceRequests
        .map(serviceRequest => serviceRequest.serviceCategoryName.trim())
        .filter(name => name.length > 0),
    ),
  );

  if (categoryNames.length === 0) {
    return `${serviceRequests.length} service request${
      serviceRequests.length === 1 ? '' : 's'
    }`;
  }

  return categoryNames.join(', ');
};

export const formatBookingReviewSummary = (
  reviews: BookingReviewRecord[] = [],
) => {
  if (reviews.length === 0) {
    return 'No reviews yet';
  }

  const totalRating = reviews.reduce(
    (sum, review) => sum + Math.max(review.rating, 0),
    0,
  );
  const averageRating = totalRating / reviews.length;

  return `${averageRating.toFixed(1)} / 5 from ${reviews.length} review${
    reviews.length === 1 ? '' : 's'
  }`;
};
