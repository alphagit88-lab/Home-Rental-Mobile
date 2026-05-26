import {
  ProviderServiceAreaRecord,
  ProviderResponseStatus,
  ProviderServiceRequestMapMarker,
  RentalServiceRequestRecord,
  RentalServiceRequestStatus,
  ServiceCategoryRecord,
} from '../types/rentalService';
import {API_BASE_URL} from './rentalAuth';

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{msg?: string; message?: string}>;
};

type QueryOptions = {
  limit?: number;
  status?: string;
};

type ProviderRequestMapData = {
  assignedRequests: RentalServiceRequestRecord[];
  markers: ProviderServiceRequestMapMarker[];
  nearbyRequests: RentalServiceRequestRecord[];
  serviceAreas: ProviderServiceAreaRecord[];
};

const SERVICE_REQUESTS_API_BASE_PATH = '/api/rental-service-requests';

const getErrorMessage = (body: ApiEnvelope<unknown> | null, fallback: string) =>
  body?.errors?.[0]?.msg ??
  body?.errors?.[0]?.message ??
  body?.message ??
  fallback;

const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.append(key, String(value));
  });

  const serializedParams = searchParams.toString();
  return serializedParams.length > 0 ? `?${serializedParams}` : '';
};

const toNumber = (value: unknown, fallback: number) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim().length === 0)
  ) {
    return fallback;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const toNullableNumber = (value: unknown) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim().length === 0)
  ) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const toNullableString = (value: unknown) => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalizedValue = String(value).trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const toBoolean = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value.trim().toLowerCase() === 'true') {
      return true;
    }

    if (value.trim().toLowerCase() === 'false') {
      return false;
    }
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return fallback;
};

const normalizeRequestStatus = (value: unknown): RentalServiceRequestStatus => {
  const normalizedValue = String(value ?? 'pending').trim().toLowerCase();

  if (
    normalizedValue === 'awaiting_full_payment' ||
    normalizedValue === 'accepted' ||
    normalizedValue === 'cancelled' ||
    normalizedValue === 'completed'
  ) {
    return normalizedValue;
  }

  return 'pending';
};

const normalizeProviderResponseStatus = (
  value: unknown,
): ProviderResponseStatus | null => {
  const normalizedValue = String(value ?? '').trim().toLowerCase();

  if (normalizedValue === 'accepted' || normalizedValue === 'rejected') {
    return normalizedValue;
  }

  return null;
};

export const normalizeServiceCategory = (
  category: Record<string, unknown>,
): ServiceCategoryRecord => ({
  createdAt: toNullableString(category.createdAt ?? category.created_at),
  description: toNullableString(category.description),
  id: toNumber(category.id, 0),
  isActive: toBoolean(category.isActive ?? category.is_active, true),
  name: String(category.name ?? 'Untitled service'),
  updatedAt: toNullableString(category.updatedAt ?? category.updated_at),
});

export const normalizeProviderServiceArea = (
  serviceArea: Record<string, unknown>,
): ProviderServiceAreaRecord => ({
  areaRadiusKm: toNullableNumber(
    serviceArea.areaRadiusKm ?? serviceArea.area_radius_km,
  ),
  city: String(serviceArea.city ?? ''),
  country: String(serviceArea.country ?? ''),
  createdAt: toNullableString(
    serviceArea.createdAt ?? serviceArea.created_at,
  ),
  id: toNumber(serviceArea.id, 0),
  latitude: toNullableNumber(serviceArea.latitude ?? serviceArea.lat),
  longitude: toNullableNumber(
    serviceArea.longitude ?? serviceArea.lng ?? serviceArea.lon,
  ),
  updatedAt: toNullableString(
    serviceArea.updatedAt ?? serviceArea.updated_at,
  ),
});

export const normalizeRentalServiceRequest = (
  request: Record<string, unknown>,
): RentalServiceRequestRecord => ({
  bookingCode: String(
    request.bookingCode ?? request.booking_code ?? request.code ?? '',
  ),
  bookingStatus: toNullableString(
    request.bookingStatus ?? request.booking_status,
  ),
  checkIn: String(request.checkIn ?? request.check_in ?? ''),
  checkOut: String(request.checkOut ?? request.check_out ?? ''),
  createdAt: toNullableString(request.createdAt ?? request.created_at),
  distanceKm: toNullableNumber(request.distanceKm ?? request.distance_km),
  guestCount: toNumber(request.guestCount ?? request.guest_count, 1),
  id: toNumber(request.id, 0),
  latitude: toNumber(request.latitude ?? request.lat, 0),
  locationText: String(
    request.locationText ?? request.location_text ?? request.location ?? '',
  ),
  longitude: toNumber(
    request.longitude ?? request.lng ?? request.lon ?? request.long,
    0,
  ),
  ownerEmail: toNullableString(request.ownerEmail ?? request.owner_email),
  ownerId: toNumber(request.ownerId ?? request.owner_id, 0),
  ownerName: toNullableString(request.ownerName ?? request.owner_name),
  paymentStatus: toNullableString(
    request.paymentStatus ?? request.payment_status,
  ),
  propertyId: toNumber(request.propertyId ?? request.property_id, 0),
  propertyTitle: String(
    request.propertyTitle ?? request.property_title ?? 'Untitled Property',
  ),
  providerResponseStatus: normalizeProviderResponseStatus(
    request.providerResponseStatus ?? request.provider_response_status,
  ),
  requestStatus: normalizeRequestStatus(
    request.requestStatus ?? request.request_status ?? request.status,
  ),
  responseNotes: toNullableString(
    request.responseNotes ?? request.response_notes,
  ),
  rentalBookingId: toNumber(
    request.rentalBookingId ?? request.rental_booking_id,
    0,
  ),
  serviceAreaCity: toNullableString(
    request.serviceAreaCity ?? request.service_area_city,
  ),
  serviceAreaId: toNullableNumber(
    request.serviceAreaId ?? request.service_area_id,
  ),
  serviceCategoryDescription: toNullableString(
    request.serviceCategoryDescription ?? request.service_category_description,
  ),
  serviceCategoryId: toNumber(
    request.serviceCategoryId ?? request.service_category_id,
    0,
  ),
  serviceCategoryName: String(
    request.serviceCategoryName ?? request.service_category_name ?? 'Service',
  ),
  serviceProviderEmail: toNullableString(
    request.serviceProviderEmail ?? request.service_provider_email,
  ),
  serviceProviderId: toNullableNumber(
    request.serviceProviderId ?? request.service_provider_id,
  ),
  serviceProviderName: toNullableString(
    request.serviceProviderName ?? request.service_provider_name,
  ),
  serviceProviderPhone: toNullableString(
    request.serviceProviderPhone ?? request.service_provider_phone,
  ),
  tenantEmail: toNullableString(request.tenantEmail ?? request.tenant_email),
  tenantId: toNumber(request.tenantId ?? request.tenant_id, 0),
  tenantName: toNullableString(request.tenantName ?? request.tenant_name),
  tenantNotes: toNullableString(request.tenantNotes ?? request.tenant_notes),
  updatedAt: toNullableString(request.updatedAt ?? request.updated_at),
});

export const normalizeProviderServiceRequestMarker = (
  marker: Record<string, unknown>,
): ProviderServiceRequestMapMarker => ({
  bookingCode: String(
    marker.bookingCode ?? marker.booking_code ?? marker.code ?? '',
  ),
  bucket:
    String(marker.bucket ?? 'nearby').trim().toLowerCase() === 'assigned'
      ? 'assigned'
      : 'nearby',
  bucketLabel: toNullableString(marker.bucketLabel ?? marker.bucket_label),
  distanceKm: toNullableNumber(marker.distanceKm ?? marker.distance_km),
  id: toNumber(marker.id, 0),
  latitude: toNumber(marker.latitude ?? marker.lat, 0),
  locationText: String(
    marker.locationText ?? marker.location_text ?? marker.location ?? '',
  ),
  longitude: toNumber(marker.longitude ?? marker.lng ?? marker.lon, 0),
  ownerName: toNullableString(marker.ownerName ?? marker.owner_name),
  propertyTitle: String(
    marker.propertyTitle ?? marker.property_title ?? 'Untitled Property',
  ),
  serviceCategoryId: toNumber(
    marker.serviceCategoryId ?? marker.service_category_id,
    0,
  ),
  serviceCategoryName: String(
    marker.serviceCategoryName ?? marker.service_category_name ?? 'Service',
  ),
  status: normalizeRequestStatus(
    marker.status ?? marker.requestStatus ?? marker.request_status,
  ),
  tenantName: toNullableString(marker.tenantName ?? marker.tenant_name),
});

const request = async <T>(
  path: string,
  options: RequestInit,
  fallbackMessage: string,
) => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
  } catch (error) {
    throw new Error(
      'Cannot reach the service request backend. Check the API base URL and backend server.',
    );
  }

  let body: ApiEnvelope<T> | null = null;

  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch (error) {
    body = null;
  }

  if (!response.ok || !body?.success || !body.data) {
    throw new Error(getErrorMessage(body, fallbackMessage));
  }

  return body.data;
};

const requestAllowEmpty = async <T>(
  path: string,
  options: RequestInit,
  fallbackMessage: string,
) => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
  } catch (error) {
    throw new Error(
      'Cannot reach the service request backend. Check the API base URL and backend server.',
    );
  }

  let body: ApiEnvelope<T> | null = null;

  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch (error) {
    body = null;
  }

  if (!response.ok || !body?.success) {
    throw new Error(getErrorMessage(body, fallbackMessage));
  }

  return body.data ?? null;
};

const requestPrivate = async <T>(
  path: string,
  token: string,
  options: RequestInit,
  fallbackMessage: string,
) =>
  request<T>(
    path,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
    },
    fallbackMessage,
  );

const requestPrivateAllowEmpty = async <T>(
  path: string,
  token: string,
  options: RequestInit,
  fallbackMessage: string,
) =>
  requestAllowEmpty<T>(
    path,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
    },
    fallbackMessage,
  );

export const getServiceCategories = async () => {
  const data = await request<{categories: Record<string, unknown>[]}>(
    '/api/service-categories',
    {
      method: 'GET',
    },
    'Unable to load service categories.',
  );

  return data.categories.map(normalizeServiceCategory);
};

export const getProviderServiceCategories = async (token: string) => {
  const data = await requestPrivate<{categories: Record<string, unknown>[]}>(
    `${SERVICE_REQUESTS_API_BASE_PATH}/provider/categories`,
    token,
    {
      method: 'GET',
    },
    'Unable to load your provider categories.',
  );

  return data.categories.map(normalizeServiceCategory);
};

export const updateProviderServiceCategories = async (
  token: string,
  serviceCategoryIds: number[],
) => {
  const data = await requestPrivate<{categories: Record<string, unknown>[]}>(
    `${SERVICE_REQUESTS_API_BASE_PATH}/provider/categories`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify({serviceCategoryIds}),
    },
    'Unable to update your provider categories.',
  );

  return data.categories.map(normalizeServiceCategory);
};

export const getProviderNearbyServiceRequests = async (
  token: string,
  options: QueryOptions = {},
) => {
  const data = await requestPrivate<{
    markers?: Record<string, unknown>[];
    requests: Record<string, unknown>[];
  }>(
    `${SERVICE_REQUESTS_API_BASE_PATH}/provider/nearby${buildQueryString({
      limit: options.limit,
    })}`,
    token,
    {
      method: 'GET',
    },
    'Unable to load nearby service requests.',
  );

  return {
    markers: Array.isArray(data.markers)
      ? data.markers.map(normalizeProviderServiceRequestMarker)
      : [],
    requests: data.requests.map(normalizeRentalServiceRequest),
  };
};

export const getProviderAssignedServiceRequests = async (
  token: string,
  options: QueryOptions = {},
) => {
  const data = await requestPrivate<{
    markers?: Record<string, unknown>[];
    requests: Record<string, unknown>[];
  }>(
    `${SERVICE_REQUESTS_API_BASE_PATH}/provider/my${buildQueryString({
      limit: options.limit,
      status: options.status,
    })}`,
    token,
    {
      method: 'GET',
    },
    'Unable to load your assigned service requests.',
  );

  return {
    markers: Array.isArray(data.markers)
      ? data.markers.map(normalizeProviderServiceRequestMarker)
      : [],
    requests: data.requests.map(normalizeRentalServiceRequest),
  };
};

export const getProviderServiceRequestMapData = async (
  token: string,
  options: QueryOptions = {},
): Promise<ProviderRequestMapData> => {
  const data = await requestPrivate<{
    assignedRequests?: Record<string, unknown>[];
    markers?: Record<string, unknown>[];
    nearbyRequests?: Record<string, unknown>[];
    serviceAreas?: Record<string, unknown>[];
  }>(
    `${SERVICE_REQUESTS_API_BASE_PATH}/provider/map${buildQueryString({
      limit: options.limit,
    })}`,
    token,
    {
      method: 'GET',
    },
    'Unable to load your provider map data.',
  );

  const nearbyRequests = Array.isArray(data.nearbyRequests)
    ? data.nearbyRequests.map(normalizeRentalServiceRequest)
    : [];
  const assignedRequests = Array.isArray(data.assignedRequests)
    ? data.assignedRequests.map(normalizeRentalServiceRequest)
    : [];

  return {
    assignedRequests,
    markers: [
      ...nearbyRequests.map(request => ({
        bookingCode: request.bookingCode,
        bucket: 'nearby' as const,
        bucketLabel: 'Nearby',
        distanceKm: request.distanceKm,
        id: request.id,
        latitude: request.latitude,
        locationText: request.locationText,
        longitude: request.longitude,
        ownerName: request.ownerName,
        propertyTitle: request.propertyTitle,
        serviceCategoryId: request.serviceCategoryId,
        serviceCategoryName: request.serviceCategoryName,
        status: request.requestStatus,
        tenantName: request.tenantName,
      })),
      ...assignedRequests.map(request => ({
        bookingCode: request.bookingCode,
        bucket: 'assigned' as const,
        bucketLabel: 'Accepted',
        distanceKm: request.distanceKm,
        id: request.id,
        latitude: request.latitude,
        locationText: request.locationText,
        longitude: request.longitude,
        ownerName: request.ownerName,
        propertyTitle: request.propertyTitle,
        serviceCategoryId: request.serviceCategoryId,
        serviceCategoryName: request.serviceCategoryName,
        status: request.requestStatus,
        tenantName: request.tenantName,
      })),
    ],
    nearbyRequests,
    serviceAreas: Array.isArray(data.serviceAreas)
      ? data.serviceAreas.map(normalizeProviderServiceArea)
      : [],
  };
};

export const getProviderServiceAreas = async (token: string) => {
  const data = await requestPrivate<{serviceAreas: Record<string, unknown>[]}>(
    '/api/supplier/service-areas',
    token,
    {
      method: 'GET',
    },
    'Unable to load your service areas.',
  );

  return data.serviceAreas.map(normalizeProviderServiceArea);
};

export const createProviderServiceArea = async (
  token: string,
  params: {
    areaRadiusKm: number;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  },
) => {
  const data = await requestPrivate<{serviceArea: Record<string, unknown>}>(
    '/api/supplier/service-areas',
    token,
    {
      method: 'POST',
      body: JSON.stringify(params),
    },
    'Unable to create your service area.',
  );

  return normalizeProviderServiceArea(data.serviceArea);
};

export const deleteProviderServiceArea = async (
  token: string,
  serviceAreaId: number,
) => {
  await requestPrivateAllowEmpty<Record<string, never>>(
    `/api/supplier/service-areas/${serviceAreaId}`,
    token,
    {
      method: 'DELETE',
    },
    'Unable to delete this service area.',
  );
};

export const respondToProviderServiceRequest = async (
  token: string,
  requestId: number,
  action: 'accept' | 'reject',
  responseNotes?: string,
) => {
  const data = await requestPrivate<{
    providerResponse?: Record<string, unknown>;
    request: Record<string, unknown>;
  }>(
    `${SERVICE_REQUESTS_API_BASE_PATH}/${requestId}/respond`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        action,
        responseNotes: responseNotes?.trim() ? responseNotes.trim() : undefined,
      }),
    },
    `Unable to ${action} this service request.`,
  );

  return {
    providerResponse:
      data.providerResponse && typeof data.providerResponse === 'object'
        ? {
            createdAt: toNullableString(
              data.providerResponse.createdAt ??
                data.providerResponse.created_at,
            ),
            providerId: toNumber(
              data.providerResponse.providerId ??
                data.providerResponse.provider_id,
              0,
            ),
            responseNotes: toNullableString(
              data.providerResponse.responseNotes ??
                data.providerResponse.response_notes,
            ),
            responseStatus: normalizeProviderResponseStatus(
              data.providerResponse.responseStatus ??
                data.providerResponse.response_status,
            ),
            updatedAt: toNullableString(
              data.providerResponse.updatedAt ??
                data.providerResponse.updated_at,
            ),
          }
        : null,
    request: normalizeRentalServiceRequest(data.request),
  };
};
