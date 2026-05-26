import {useCallback, useEffect, useState} from 'react';
import {getAuthSession} from '../services/authSession';
import {BookingRecord, getTenantBookings} from '../services/bookings';

type UseTenantBookingsResult = {
  bookings: BookingRecord[];
  errorMessage: string | null;
  loading: boolean;
  reload: () => Promise<void>;
};

export const useTenantBookings = (
  limit?: number,
): UseTenantBookingsResult => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    const session = getAuthSession();

    if (!session?.token) {
      setBookings([]);
      setErrorMessage('Sign in to load your bookings.');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const fetchedBookings = await getTenantBookings(session.token, {limit});
      setBookings(fetchedBookings);
      setErrorMessage(null);
    } catch (error) {
      setBookings([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load your bookings.',
      );
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  return {
    bookings,
    errorMessage,
    loading,
    reload: loadBookings,
  };
};
