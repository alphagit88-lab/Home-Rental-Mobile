import {useCallback, useEffect, useState} from 'react';
import {getAuthSession} from '../services/authSession';
import {
  getProviderServiceCategories,
  updateProviderServiceCategories,
} from '../services/rentalServiceRequests';
import {ServiceCategoryRecord} from '../types/rentalService';

type UseProviderCategoriesResult = {
  categories: ServiceCategoryRecord[];
  errorMessage: string | null;
  loading: boolean;
  reload: () => Promise<void>;
  saveCategoryIds: (serviceCategoryIds: number[]) => Promise<ServiceCategoryRecord[]>;
  saving: boolean;
};

export const useProviderCategories = (): UseProviderCategoriesResult => {
  const [categories, setCategories] = useState<ServiceCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    const session = getAuthSession();

    if (!session?.token) {
      setCategories([]);
      setErrorMessage('Sign in as a service provider to load your categories.');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const fetchedCategories = await getProviderServiceCategories(session.token);
      setCategories(fetchedCategories);
      setErrorMessage(null);
    } catch (error) {
      setCategories([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load your provider categories.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const saveCategoryIds = useCallback(async (serviceCategoryIds: number[]) => {
    const session = getAuthSession();

    if (!session?.token) {
      throw new Error('Sign in as a service provider to update your categories.');
    }

    setSaving(true);

    try {
      const updatedCategories = await updateProviderServiceCategories(
        session.token,
        serviceCategoryIds,
      );
      setCategories(updatedCategories);
      setErrorMessage(null);
      return updatedCategories;
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : 'Unable to update your provider categories.';
      setErrorMessage(nextMessage);
      throw new Error(nextMessage);
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    categories,
    errorMessage,
    loading,
    reload: loadCategories,
    saveCategoryIds,
    saving,
  };
};
