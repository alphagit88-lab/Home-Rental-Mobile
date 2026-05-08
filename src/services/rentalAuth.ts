import {Platform} from 'react-native';

export type RentalRole = 'tenant' | 'owner' | 'service_provider';
type BackendTarget = 'cloudflare' | 'local';

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
  errors?: Array<{msg?: string; message?: string}>;
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

type UpdateProfileParams = {
  currentPassword?: string;
  email: string;
  name: string;
  newPassword?: string;
};

// Switch this between 'local' and 'cloudflare' depending on what you want to test.
// Replace the Cloudflare tunnel URL with your stable production API before release.
const API_BACKEND_TARGET: BackendTarget = 'cloudflare';
const CLOUDFLARE_API_BASE_URL =
  'https://integrity-matching-attributes-router.trycloudflare.com/';

// Use your machine LAN IP for testing from a physical device on the same network.
const LOCAL_MANUAL_API_BASE_URL = 'http://192.168.1.103:5001';
const LOCAL_ANDROID_EMULATOR_API_BASE_URL = 'http://10.0.2.2:5001';
const LOCAL_IOS_SIMULATOR_API_BASE_URL = 'http://localhost:5001';

const getLocalApiBaseUrl = () => {
  if (LOCAL_MANUAL_API_BASE_URL) {
    return LOCAL_MANUAL_API_BASE_URL;
  }

  return Platform.OS === 'android'
    ? LOCAL_ANDROID_EMULATOR_API_BASE_URL
    : LOCAL_IOS_SIMULATOR_API_BASE_URL;
};

const getApiBaseUrl = () => {
  const apiBaseUrls: Record<BackendTarget, string> = {
    cloudflare: CLOUDFLARE_API_BASE_URL,
    local: getLocalApiBaseUrl(),
  };

  return apiBaseUrls[API_BACKEND_TARGET];
};

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

const API_BASE_URL = normalizeBaseUrl(getApiBaseUrl());

const getErrorMessage = (
  body: ApiEnvelope<unknown> | null,
  fallback: string,
) => {
  const validationMessage =
    body?.errors?.[0]?.msg ?? body?.errors?.[0]?.message;

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
    throw new Error('Cannot reach the Home Rent server right now.');
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
  request<{user: AuthUser}>(
    '/api/rental-auth/me',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    'Unable to fetch your account.',
  );

export const updateProfile = async (
  token: string,
  params: UpdateProfileParams,
) =>
  request<{user: AuthUser}>(
    '/api/rental-auth/profile',
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    },
    'Unable to update your profile.',
  );

export {API_BASE_URL};
