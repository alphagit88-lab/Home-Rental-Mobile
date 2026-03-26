import {useCallback, useEffect, useState} from 'react';
import {
  getActiveProperties,
  PropertyRecord,
} from '../services/properties';

type UseTenantPropertiesResult = {
  errorMessage: string | null;
  loading: boolean;
  properties: PropertyRecord[];
  reload: () => Promise<void>;
};

export const useTenantProperties = (): UseTenantPropertiesResult => {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    setLoading(true);

    try {
      const fetchedProperties = await getActiveProperties();
      setProperties(fetchedProperties);
      setErrorMessage(null);
    } catch (error) {
      setProperties([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load properties.',
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
