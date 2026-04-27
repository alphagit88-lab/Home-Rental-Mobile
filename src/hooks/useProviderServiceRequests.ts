import {useCallback, useEffect, useState} from 'react';
import {getAuthSession} from '../services/authSession';
import {
  getProviderServiceRequestMapData,
  respondToProviderServiceRequest,
} from '../services/rentalServiceRequests';
import {
  ProviderServiceAreaRecord,
  ProviderServiceRequestMapMarker,
  RentalServiceRequestRecord,
} from '../types/rentalService';

type UseProviderServiceRequestsOptions = {
  limit?: number;
};

type UseProviderServiceRequestsResult = {
  assignedRequests: RentalServiceRequestRecord[];
  errorMessage: string | null;
  loading: boolean;
  markers: ProviderServiceRequestMapMarker[];
  nearbyRequests: RentalServiceRequestRecord[];
  reload: () => Promise<void>;
  respondToRequest: (
    requestId: number,
    action: 'accept' | 'reject',
    responseNotes?: string,
  ) => Promise<void>;
  respondingRequestId: number | null;
  serviceAreas: ProviderServiceAreaRecord[];
};

export const useProviderServiceRequests = (
  options: UseProviderServiceRequestsOptions = {},
): UseProviderServiceRequestsResult => {
  const [nearbyRequests, setNearbyRequests] = useState<
    RentalServiceRequestRecord[]
  >([]);
  const [assignedRequests, setAssignedRequests] = useState<
    RentalServiceRequestRecord[]
  >([]);
  const [markers, setMarkers] = useState<ProviderServiceRequestMapMarker[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ProviderServiceAreaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [respondingRequestId, setRespondingRequestId] = useState<number | null>(
    null,
  );

  const loadRequests = useCallback(async () => {
    const session = getAuthSession();

    if (!session?.token) {
      setNearbyRequests([]);
      setAssignedRequests([]);
      setMarkers([]);
      setServiceAreas([]);
      setErrorMessage('Sign in as a service provider to load service requests.');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await getProviderServiceRequestMapData(session.token, options);
      setNearbyRequests(data.nearbyRequests);
      setAssignedRequests(data.assignedRequests);
      setMarkers(data.markers);
      setServiceAreas(data.serviceAreas);
      setErrorMessage(null);
    } catch (error) {
      setNearbyRequests([]);
      setAssignedRequests([]);
      setMarkers([]);
      setServiceAreas([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load service requests.',
      );
    } finally {
      setLoading(false);
    }
  }, [options.limit]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleRespondToRequest = useCallback(
    async (
      requestId: number,
      action: 'accept' | 'reject',
      responseNotes?: string,
    ) => {
      const session = getAuthSession();

      if (!session?.token) {
        throw new Error('Sign in as a service provider to manage requests.');
      }

      setRespondingRequestId(requestId);

      try {
        await respondToProviderServiceRequest(
          session.token,
          requestId,
          action,
          responseNotes,
        );
        await loadRequests();
      } finally {
        setRespondingRequestId(null);
      }
    },
    [loadRequests],
  );

  return {
    assignedRequests,
    errorMessage,
    loading,
    markers,
    nearbyRequests,
    reload: loadRequests,
    respondToRequest: handleRespondToRequest,
    respondingRequestId,
    serviceAreas,
  };
};
