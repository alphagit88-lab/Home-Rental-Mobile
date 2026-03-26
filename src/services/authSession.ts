import { AuthSession, AuthUser } from './rentalAuth';

let currentAuthSession: AuthSession | null = null;

export const setAuthSession = (session: AuthSession) => {
  currentAuthSession = session;
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
};

export const clearAuthSession = () => {
  currentAuthSession = null;
};
