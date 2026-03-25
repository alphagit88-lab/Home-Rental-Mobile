import { Platform } from 'react-native';

export type RentalRole = 'tenant' | 'owner';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: RentalRole;
  systemRole: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ msg?: string; message?: string }>;
};

type SignInParams = {
  email: string;
  password: string;
};

type SignUpParams = {
  email: string;
  name: string;
  password: string;
  role: RentalRole;
};

const MANUAL_API_BASE_URL = '';
const ANDROID_EMULATOR_API_BASE_URL = 'http://10.0.2.2:5000';
const IOS_SIMULATOR_API_BASE_URL = 'http://127.0.0.1:5000';

const getApiBaseUrl = () => {
  if (MANUAL_API_BASE_URL) {
    return MANUAL_API_BASE_URL;
  }

  return Platform.OS === 'android'
    ? ANDROID_EMULATOR_API_BASE_URL
    : IOS_SIMULATOR_API_BASE_URL;
};

const API_BASE_URL = getApiBaseUrl();

const getErrorMessage = (body: ApiEnvelope<unknown> | null, fallback: string) => {
  const validationMessage = body?.errors?.[0]?.msg ?? body?.errors?.[0]?.message;

  return validationMessage || body?.message || fallback;
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
      'Cannot reach the backend. Check the API base URL in src/services/rentalAuth.ts.',
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

export const signIn = async (params: SignInParams) =>
  request<AuthSession>(
    '/api/rental-auth/login',
    {
      method: 'POST',
      body: JSON.stringify(params),
    },
    'Unable to sign in.',
  );

export const signUp = async (params: SignUpParams) =>
  request<AuthSession>(
    '/api/rental-auth/signup',
    {
      method: 'POST',
      body: JSON.stringify(params),
    },
    'Unable to create your account.',
  );

export const getCurrentUser = async (token: string) =>
  request<{ user: AuthUser }>(
    '/api/rental-auth/me',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    'Unable to fetch your account.',
  );

export { API_BASE_URL };
