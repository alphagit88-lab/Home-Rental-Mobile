import {API_BASE_URL} from './rentalAuth';

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{msg?: string; message?: string}>;
};

export type BookingMessageRole = 'tenant' | 'owner';

export type BookingMessageRecord = {
  createdAt: string | null;
  id: number;
  isRead: boolean;
  messageText: string;
  readAt: string | null;
  recipientId: number;
  recipientName: string | null;
  recipientRole: BookingMessageRole;
  rentalBookingId: number;
  senderId: number;
  senderName: string | null;
  senderRole: BookingMessageRole;
  updatedAt: string | null;
};

type SendBookingMessageParams = {
  messageText: string;
};

const BOOKINGS_API_BASE_PATH = '/api/rental-bookings';

const getErrorMessage = (body: ApiEnvelope<unknown> | null, fallback: string) =>
  body?.errors?.[0]?.msg ??
  body?.errors?.[0]?.message ??
  body?.message ??
  fallback;

const toNullableString = (value: unknown) => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalizedValue = String(value).trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const toNumber = (value: unknown, fallback = 0) => {
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

const toBoolean = (value: unknown) =>
  value === true || value === 'true' || value === 1 || value === '1';

const normalizeMessageRole = (value: unknown): BookingMessageRole =>
  String(value ?? '').trim().toLowerCase() === 'owner' ? 'owner' : 'tenant';

const normalizeBookingMessage = (
  message: Record<string, unknown>,
): BookingMessageRecord => ({
  createdAt: toNullableString(message.createdAt ?? message.created_at),
  id: toNumber(message.id),
  isRead: toBoolean(message.isRead ?? message.is_read),
  messageText: String(
    message.messageText ?? message.message_text ?? message.text ?? '',
  ),
  readAt: toNullableString(message.readAt ?? message.read_at),
  recipientId: toNumber(message.recipientId ?? message.recipient_id),
  recipientName: toNullableString(
    message.recipientName ?? message.recipient_name,
  ),
  recipientRole: normalizeMessageRole(
    message.recipientRole ?? message.recipient_role,
  ),
  rentalBookingId: toNumber(
    message.rentalBookingId ?? message.rental_booking_id,
  ),
  senderId: toNumber(message.senderId ?? message.sender_id),
  senderName: toNullableString(message.senderName ?? message.sender_name),
  senderRole: normalizeMessageRole(message.senderRole ?? message.sender_role),
  updatedAt: toNullableString(message.updatedAt ?? message.updated_at),
});

const request = async <T>(
  path: string,
  token: string,
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
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
    });
  } catch (error) {
    throw new Error('Cannot reach the booking chat backend right now.');
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

export const getBookingMessages = async (token: string, bookingId: number) => {
  const data = await request<{messages: Record<string, unknown>[]}>(
    `${BOOKINGS_API_BASE_PATH}/${bookingId}/messages`,
    token,
    {
      method: 'GET',
    },
    'Unable to load booking messages.',
  );

  return data.messages.map(normalizeBookingMessage);
};

export const sendBookingMessage = async (
  token: string,
  bookingId: number,
  params: SendBookingMessageParams,
) => {
  const data = await request<Record<string, unknown>>(
    `${BOOKINGS_API_BASE_PATH}/${bookingId}/messages`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        messageText: params.messageText.trim(),
      }),
    },
    'Unable to send your message.',
  );

  const message =
    data.bookingMessage && typeof data.bookingMessage === 'object'
      ? (data.bookingMessage as Record<string, unknown>)
      : data.message && typeof data.message === 'object'
        ? (data.message as Record<string, unknown>)
        : data;

  return normalizeBookingMessage(message);
};
