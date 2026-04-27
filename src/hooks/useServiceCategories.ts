import {useCallback, useEffect, useState} from 'react';
import {
  getServiceCategories,
} from '../services/rentalServiceRequests';
import {ServiceCategoryRecord} from '../types/rentalService';

type UseServiceCategoriesResult = {
  categories: ServiceCategoryRecord[];
  errorMessage: string | null;
  loading: boolean;
  reload: () => Promise<void>;
};

export const useServiceCategories = (): UseServiceCategoriesResult => {
  const [categories, setCategories] = useState<ServiceCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);

    try {
      const fetchedCategories = await getServiceCategories();
      setCategories(fetchedCategories);
      setErrorMessage(null);
    } catch (error) {
      setCategories([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load service categories.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  return {
    categories,
    errorMessage,
    loading,
    reload: loadCategories,
  };
};
