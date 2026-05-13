import {useCallback, useEffect, useState} from 'react';
import {getAuthSession} from '../services/authSession';
import {
  createProviderServiceArea,
  deleteProviderServiceArea,
  getProviderServiceAreas,
} from '../services/rentalServiceRequests';
import {ProviderServiceAreaRecord} from '../types/rentalService';

type CreateProviderServiceAreaParams = {
  areaRadiusKm: number;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
};

type UseProviderServiceAreasResult = {
  createArea: (
    params: CreateProviderServiceAreaParams,
  ) => Promise<ProviderServiceAreaRecord>;
  deleteArea: (serviceAreaId: number) => Promise<void>;
  deletingAreaId: number | null;
  errorMessage: string | null;
  loading: boolean;
  reload: () => Promise<void>;
  saving: boolean;
  serviceAreas: ProviderServiceAreaRecord[];
};

export const useProviderServiceAreas = (): UseProviderServiceAreasResult => {
  const [serviceAreas, setServiceAreas] = useState<ProviderServiceAreaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingAreaId, setDeletingAreaId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadServiceAreas = useCallback(async () => {
    const session = getAuthSession();

    if (!session?.token) {
      setServiceAreas([]);
      setErrorMessage('Sign in to load your service areas.');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const fetchedServiceAreas = await getProviderServiceAreas(session.token);
      setServiceAreas(fetchedServiceAreas);
      setErrorMessage(null);
    } catch (error) {
      setServiceAreas([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load your service areas.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServiceAreas();
  }, [loadServiceAreas]);

  const createArea = useCallback(
    async (params: CreateProviderServiceAreaParams) => {
      const session = getAuthSession();

      if (!session?.token) {
        throw new Error('Sign in to add a service area.');
      }

      setSaving(true);

      try {
        const createdServiceArea = await createProviderServiceArea(
          session.token,
          params,
        );
        setServiceAreas(current => [createdServiceArea, ...current]);
        setErrorMessage(null);
        return createdServiceArea;
      } catch (error) {
        const nextMessage =
          error instanceof Error
            ? error.message
            : 'Unable to create your service area.';
        setErrorMessage(nextMessage);
        throw new Error(nextMessage);
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const deleteArea = useCallback(async (serviceAreaId: number) => {
    const session = getAuthSession();

    if (!session?.token) {
      throw new Error('Sign in to delete a service area.');
    }

    setDeletingAreaId(serviceAreaId);

    try {
      await deleteProviderServiceArea(session.token, serviceAreaId);
      setServiceAreas(current =>
        current.filter(serviceArea => serviceArea.id !== serviceAreaId),
      );
      setErrorMessage(null);
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : 'Unable to delete this service area.';
      setErrorMessage(nextMessage);
      throw new Error(nextMessage);
    } finally {
      setDeletingAreaId(null);
    }
  }, []);

  return {
    createArea,
    deleteArea,
    deletingAreaId,
    errorMessage,
    loading,
    reload: loadServiceAreas,
    saving,
    serviceAreas,
  };
};
