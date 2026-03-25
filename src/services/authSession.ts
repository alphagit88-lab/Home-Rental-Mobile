import { AuthSession } from './rentalAuth';

let currentAuthSession: AuthSession | null = null;

export const setAuthSession = (session: AuthSession) => {
  currentAuthSession = session;
};

export const getAuthSession = () => currentAuthSession;

export const clearAuthSession = () => {
  currentAuthSession = null;
};
