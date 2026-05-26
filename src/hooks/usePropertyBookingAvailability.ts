import {useCallback, useEffect, useState} from 'react';
import {
  getPropertyBookingAvailability,
  PropertyBookingAvailability,
} from '../services/bookings';

type UsePropertyBookingAvailabilityOptions = {
  enabled?: boolean;
  from?: string;
  to?: string;
};

type UsePropertyBookingAvailabilityResult = {
  availability: PropertyBookingAvailability | null;
  errorMessage: string | null;
  loading: boolean;
  reload: () => Promise<void>;
};

export const usePropertyBookingAvailability = (
  propertyId: number | null,
  options: UsePropertyBookingAvailabilityOptions = {},
): UsePropertyBookingAvailabilityResult => {
  const [availability, setAvailability] =
    useState<PropertyBookingAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAvailability = useCallback(async () => {
    if (!propertyId || options.enabled === false) {
      setAvailability(null);
      setErrorMessage(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const nextAvailability = await getPropertyBookingAvailability(propertyId, {
        from: options.from,
        to: options.to,
      });
      setAvailability(nextAvailability);
      setErrorMessage(null);
    } catch (error) {
      setAvailability(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load the property availability.',
      );
    } finally {
      setLoading(false);
    }
  }, [options.enabled, options.from, options.to, propertyId]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  return {
    availability,
    errorMessage,
    loading,
    reload: loadAvailability,
  };
};
