import {useCallback, useEffect, useState} from 'react';
import {getAuthSession} from '../services/authSession';
import {getMyProperties, PropertyRecord} from '../services/properties';

type UseOwnerPropertiesResult = {
  errorMessage: string | null;
  loading: boolean;
  properties: PropertyRecord[];
  reload: () => Promise<void>;
};

export const useOwnerProperties = (): UseOwnerPropertiesResult => {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    const session = getAuthSession();

    if (!session?.token) {
      setProperties([]);
      setErrorMessage('Sign in to load your properties.');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const fetchedProperties = await getMyProperties(session.token);
      setProperties(fetchedProperties);
      setErrorMessage(null);
    } catch (error) {
      setProperties([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load your properties.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProperties();
  }, [loadProperties]);

  return {
    errorMessage,
    loading,
    properties,
    reload: loadProperties,
  };
};
