import {useCallback, useEffect, useState} from 'react';
import {getAuthSession} from '../services/authSession';
import {BookingRecord, getOwnerBookings} from '../services/bookings';

type UseOwnerBookingsOptions = {
  from?: string;
  limit?: number;
  to?: string;
};

type UseOwnerBookingsResult = {
  bookings: BookingRecord[];
  errorMessage: string | null;
  loading: boolean;
  reload: () => Promise<void>;
};

export const useOwnerBookings = (
  options: UseOwnerBookingsOptions = {},
): UseOwnerBookingsResult => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    const session = getAuthSession();

    if (!session?.token) {
      setBookings([]);
      setErrorMessage('Sign in to load your property bookings.');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const fetchedBookings = await getOwnerBookings(session.token, options);
      setBookings(fetchedBookings);
      setErrorMessage(null);
    } catch (error) {
      setBookings([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load your property bookings.',
      );
    } finally {
      setLoading(false);
    }
  }, [options.from, options.limit, options.to]);

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
