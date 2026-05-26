import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthSession, AuthUser } from './rentalAuth';

const AUTH_SESSION_STORAGE_KEY = '@home-rental/auth-session';

let currentAuthSession: AuthSession | null = null;
let shouldPersistAuthSession = false;

type SetAuthSessionOptions = {
  persist?: boolean;
};

const isStoredAuthSession = (value: unknown): value is AuthSession => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<AuthSession>;

  return (
    typeof session.token === 'string' &&
    !!session.user &&
    typeof session.user === 'object' &&
    typeof session.user.id === 'number' &&
    typeof session.user.name === 'string' &&
    typeof session.user.email === 'string' &&
    typeof session.user.role === 'string' &&
    typeof session.user.systemRole === 'string'
  );
};

const syncStoredAuthSession = async () => {
  if (!currentAuthSession || !shouldPersistAuthSession) {
    await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(
    AUTH_SESSION_STORAGE_KEY,
    JSON.stringify(currentAuthSession),
  );
};

export const setAuthSession = async (
  session: AuthSession,
  options: SetAuthSessionOptions = {},
) => {
  currentAuthSession = session;
  shouldPersistAuthSession = options.persist ?? false;

  await syncStoredAuthSession();
};

export const restoreAuthSession = async () => {
  const serializedSession = await AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!serializedSession) {
    currentAuthSession = null;
    shouldPersistAuthSession = false;
    return null;
  }

  try {
    const parsedSession = JSON.parse(serializedSession) as unknown;

    if (!isStoredAuthSession(parsedSession)) {
      throw new Error('Invalid stored auth session');
    }

    currentAuthSession = parsedSession;
    shouldPersistAuthSession = true;

    return currentAuthSession;
  } catch {
    currentAuthSession = null;
    shouldPersistAuthSession = false;
    await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
};

export const getAuthSession = () => currentAuthSession;

export const updateAuthSessionUser = (user: AuthUser) => {
  if (!currentAuthSession) {
    return;
  }

  currentAuthSession = {
    ...currentAuthSession,
    user,
  };

  if (shouldPersistAuthSession) {
    void syncStoredAuthSession();
  }
};

export const clearAuthSession = async () => {
  currentAuthSession = null;
  shouldPersistAuthSession = false;

  await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
};
