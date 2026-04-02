import {normalizeDateString} from '../utils/dateInput';
import {iterateStayDates} from '../utils/bookingCalendar';
import {API_BASE_URL} from './rentalAuth';

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{msg?: string; message?: string}>;
};

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type BookingRecord = {
  bookingCode: string;
  bookingStatus: BookingStatus;
  cardLast4: string | null;
  checkIn: string;
  checkOut: string;
  createdAt: string | null;
  guestCount: number;
  id: number;
  monthlyRent: number | null;
  ownerId: number;
  ownerName: string | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  paymentStatus: PaymentStatus;
  propertyCode: string;
  propertyId: number;
  propertyLocationText: string;
  propertyTitle: string;
  tenantEmail: string | null;
  tenantId: number;
  tenantName: string | null;
  totalAmount: number | null;
  updatedAt: string | null;
};

export type PropertyBookingAvailability = {
  bookedDates: string[];
  bookings: BookingRecord[];
  from: string | null;
  propertyId: number;
  to: string | null;
};

export type CreateBookingParams = {
  cardLast4?: string | null;
  checkIn: string;
  checkOut: string;
  contactEmail: string;
  contactName: string;
  guestCount: number;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  propertyId: number;
};

type QueryOptions = {
  from?: string;
  limit?: number;
  to?: string;
};

const BOOKINGS_API_BASE_PATH = '/api/rental-bookings';

const getErrorMessage = (body: ApiEnvelope<unknown> | null, fallback: string) =>
  body?.errors?.[0]?.msg ??
  body?.errors?.[0]?.message ??
  body?.message ??
  fallback;

const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.append(key, String(value));
  });

  const serializedParams = searchParams.toString();
  return serializedParams.length > 0 ? `?${serializedParams}` : '';
};

const toNumber = (value: unknown, fallback: number) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim().length === 0)
  ) {
    return fallback;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const toNullableNumber = (value: unknown) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim().length === 0)
  ) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const toNullableString = (value: unknown) => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalizedValue = String(value).trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const normalizeBookingStatus = (value: unknown): BookingStatus => {
  const normalizedValue = String(value ?? 'pending').trim().toLowerCase();

  if (
    normalizedValue === 'confirmed' ||
    normalizedValue === 'cancelled' ||
    normalizedValue === 'completed'
  ) {
    return normalizedValue;
  }

  return 'pending';
};

const normalizePaymentStatus = (value: unknown): PaymentStatus => {
  const normalizedValue = String(value ?? 'pending').trim().toLowerCase();

  if (
    normalizedValue === 'paid' ||
    normalizedValue === 'failed' ||
    normalizedValue === 'refunded'
  ) {
    return normalizedValue;
  }

  return 'pending';
};

const normalizeDateValue = (value: unknown) => {
  const normalizedValue = normalizeDateString(toNullableString(value));
  return normalizedValue ?? '';
};

const normalizeOptionalDateValue = (value: unknown) =>
  normalizeDateString(toNullableString(value)) ?? null;

const normalizeDateArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map(item => normalizeDateString(item == null ? null : String(item)))
        .filter((item): item is string => Boolean(item)),
    ),
  ).sort((first, second) => first.localeCompare(second));
};

const normalizeBooking = (booking: Record<string, unknown>): BookingRecord => {
  const property =
    booking.property && typeof booking.property === 'object'
      ? (booking.property as Record<string, unknown>)
      : null;
  const tenant =
    booking.tenant && typeof booking.tenant === 'object'
      ? (booking.tenant as Record<string, unknown>)
      : null;
  const owner =
    booking.owner && typeof booking.owner === 'object'
      ? (booking.owner as Record<string, unknown>)
      : null;

  return {
    bookingCode: String(
      booking.bookingCode ??
        booking.booking_code ??
        booking.code ??
        booking.requestId ??
        booking.request_id ??
        `BOOK-${booking.id ?? ''}`,
    ),
    bookingStatus: normalizeBookingStatus(
      booking.bookingStatus ?? booking.booking_status ?? booking.status,
    ),
    cardLast4: toNullableString(
      booking.cardLast4 ?? booking.card_last4 ?? booking.paymentCardLast4,
    ),
    checkIn: normalizeDateValue(booking.checkIn ?? booking.check_in),
    checkOut: normalizeDateValue(booking.checkOut ?? booking.check_out),
    createdAt: toNullableString(booking.createdAt ?? booking.created_at),
    guestCount: toNumber(
      booking.guestCount ?? booking.guest_count ?? booking.guests,
      1,
    ),
    id: toNumber(booking.id, 0),
    monthlyRent: toNullableNumber(
      booking.monthlyRent ??
        booking.monthly_rent ??
        property?.monthlyRent ??
        property?.monthly_rent,
    ),
    ownerId: toNumber(
      booking.ownerId ?? booking.owner_id ?? owner?.id ?? property?.ownerId,
      0,
    ),
    ownerName: toNullableString(
      booking.ownerName ?? booking.owner_name ?? owner?.name,
    ),
    paymentMethod: toNullableString(
      booking.paymentMethod ?? booking.payment_method,
    ),
    paymentReference: toNullableString(
      booking.paymentReference ?? booking.payment_reference,
    ),
    paymentStatus: normalizePaymentStatus(
      booking.paymentStatus ?? booking.payment_status,
    ),
    propertyCode: String(
      booking.propertyCode ??
        booking.property_code ??
        property?.propertyCode ??
        property?.property_code ??
        '',
    ),
    propertyId: toNumber(
      booking.propertyId ?? booking.property_id ?? property?.id,
      0,
    ),
    propertyLocationText: String(
      booking.propertyLocationText ??
        booking.property_location_text ??
        property?.locationText ??
        property?.location_text ??
        property?.location ??
        '',
    ),
    propertyTitle: String(
      booking.propertyTitle ??
        booking.property_title ??
        property?.title ??
        booking.title ??
        'Untitled Property',
    ),
    tenantEmail: toNullableString(
      booking.tenantEmail ?? booking.tenant_email ?? tenant?.email,
    ),
    tenantId: toNumber(
      booking.tenantId ?? booking.tenant_id ?? tenant?.id,
      0,
    ),
    tenantName: toNullableString(
      booking.tenantName ?? booking.tenant_name ?? tenant?.name,
    ),
    totalAmount: toNullableNumber(
      booking.totalAmount ?? booking.total_amount ?? booking.amount,
    ),
    updatedAt: toNullableString(booking.updatedAt ?? booking.updated_at),
  };
};

const normalizeAvailability = (
  payload: Record<string, unknown>,
): PropertyBookingAvailability => {
  const bookingsSource = Array.isArray(payload.bookings)
    ? payload.bookings
    : Array.isArray(payload.items)
      ? payload.items
      : [];
  const bookings = bookingsSource
    .filter(
      (item): item is Record<string, unknown> =>
        item !== null && typeof item === 'object',
    )
    .map(normalizeBooking);
  const explicitBookedDates = normalizeDateArray(
    payload.bookedDates ??
      payload.booked_dates ??
      payload.blockedDates ??
      payload.blocked_dates,
  );
  const derivedBookedDates = Array.from(
    new Set(
      bookings.flatMap(booking =>
        iterateStayDates(booking.checkIn, booking.checkOut),
      ),
    ),
  ).sort((first, second) => first.localeCompare(second));

  return {
    bookedDates:
      explicitBookedDates.length > 0 ? explicitBookedDates : derivedBookedDates,
    bookings,
    from: normalizeOptionalDateValue(payload.from),
    propertyId: toNumber(payload.propertyId ?? payload.property_id, 0),
    to: normalizeOptionalDateValue(payload.to),
  };
};

const request = async <T>(
  path: string,
  options: RequestInit,
  fallbackMessage: string,
) => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
  } catch (error) {
    throw new Error(
      'Cannot reach the bookings backend. Check the API base URL and backend server.',
    );
  }

  let body: ApiEnvelope<T> | null = null;

  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch (error) {
    body = null;
  }

  if (!response.ok || !body?.success || !body.data) {
    throw new Error(getErrorMessage(body, fallbackMessage));
  }

  return body.data;
};

const requestPrivate = async <T>(
  path: string,
  token: string,
  options: RequestInit,
  fallbackMessage: string,
) =>
  request<T>(
    path,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
    },
    fallbackMessage,
  );

export const getTenantBookings = async (
  token: string,
  options: QueryOptions = {},
) => {
  const data = await requestPrivate<{bookings: Record<string, unknown>[]}>(
    `${BOOKINGS_API_BASE_PATH}/my${buildQueryString({
      limit: options.limit,
    })}`,
    token,
    {
      method: 'GET',
    },
    'Unable to load your bookings.',
  );

  return data.bookings.map(normalizeBooking);
};

export const getOwnerBookings = async (
  token: string,
  options: QueryOptions = {},
) => {
  const data = await requestPrivate<{bookings: Record<string, unknown>[]}>(
    `${BOOKINGS_API_BASE_PATH}/owner${buildQueryString({
      from: options.from,
      limit: options.limit,
      to: options.to,
    })}`,
    token,
    {
      method: 'GET',
    },
    'Unable to load your property bookings.',
  );

  return data.bookings.map(normalizeBooking);
};

export const getPropertyBookingAvailability = async (
  propertyId: number,
  options: QueryOptions = {},
) => {
  const data = await request<
    {availability?: Record<string, unknown>} & Record<string, unknown>
  >(
    `${BOOKINGS_API_BASE_PATH}/property/${propertyId}/availability${buildQueryString(
      {
        from: options.from,
        to: options.to,
      },
    )}`,
    {
      method: 'GET',
    },
    'Unable to load the property availability.',
  );

  return normalizeAvailability(
    data.availability && typeof data.availability === 'object'
      ? data.availability
      : data,
  );
};

export const createBooking = async (
  token: string,
  params: CreateBookingParams,
) => {
  const data = await requestPrivate<{booking: Record<string, unknown>}>(
    BOOKINGS_API_BASE_PATH,
    token,
    {
      method: 'POST',
      body: JSON.stringify(params),
    },
    'Unable to create your booking.',
  );

  return normalizeBooking(data.booking);
};
