import {normalizeDateString} from '../utils/dateInput';
import {API_BASE_URL} from './rentalAuth';

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{msg?: string; message?: string}>;
};

export type PropertyRecord = {
  id: number;
  ownerId: number | null;
  propertyCode: string;
  title: string;
  propertyType: string;
  listingType: string;
  monthlyRent: number | null;
  availableFrom: string | null;
  availableTo: string | null;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  locationText: string;
  latitude: number;
  longitude: number;
  galleryUrls: string[];
  description: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SavePropertyParams = {
  amenities: string[];
  availableFrom?: string | null;
  availableTo?: string | null;
  bathrooms: number;
  bedrooms: number;
  description: string;
  galleryUrls: string[];
  latitude?: number;
  listingType: string;
  locationText: string;
  longitude?: number;
  monthlyRent?: number | null;
  propertyType: string;
  title: string;
};

const DEFAULT_COORDINATES = {
  latitude: 6.9271,
  longitude: 79.8612,
};
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const COORDINATE_MATCH_TOLERANCE = 0.0002;
const geocodeCache = new Map<
  string,
  Promise<{latitude: number; longitude: number} | null>
>();
const GEOCODE_TITLE_STOP_WORDS = new Set([
  'apartment',
  'boarding',
  'boys',
  'flat',
  'girls',
  'home',
  'hostel',
  'house',
  'property',
  'residence',
  'room',
  'rooms',
  'stay',
  'villa',
]);

const LOCATION_COORDINATE_PRESETS: Record<
  string,
  {latitude: number; longitude: number}
> = {
  colombo: {
    latitude: 6.9094,
    longitude: 79.8542,
  },
  kandy: {
    latitude: 7.2906,
    longitude: 80.6337,
  },
  galle: {
    latitude: 6.0535,
    longitude: 80.221,
  },
  negombo: {
    latitude: 7.2083,
    longitude: 79.8358,
  },
};

const getErrorMessage = (body: ApiEnvelope<unknown> | null, fallback: string) =>
  body?.errors?.[0]?.msg ??
  body?.errors?.[0]?.message ??
  body?.message ??
  fallback;

const toNumber = (value: unknown, fallback: number) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim().length === 0)
  ) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNullableNumber = (value: unknown) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim().length === 0)
  ) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeOptionalDate = (value: unknown) => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalizedValue = String(value).trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  return normalizeDateString(normalizedValue) ?? normalizedValue.slice(0, 10);
};

const getCoordinatePreset = (locationText: string) => {
  const normalizedLocation = locationText.trim().toLowerCase();
  const presetKey = Object.keys(LOCATION_COORDINATE_PRESETS).find(key =>
    normalizedLocation.includes(key),
  );

  return presetKey
    ? LOCATION_COORDINATE_PRESETS[presetKey]
    : DEFAULT_COORDINATES;
};

const isValidLatitude = (value: number) => value >= -90 && value <= 90;

const isValidLongitude = (value: number) => value >= -180 && value <= 180;

const areCoordinatesClose = (first: number, second: number) =>
  Math.abs(first - second) <= COORDINATE_MATCH_TOLERANCE;

const buildGeocodeQueries = (locationText: string, title?: string) => {
  const normalizedLocation = locationText.trim();
  const normalizedTitle = String(title ?? '').trim();
  const cleanedTitle = normalizedTitle
    .split(/\s+/)
    .filter(word => {
      const normalizedWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedWord.length > 0 && !GEOCODE_TITLE_STOP_WORDS.has(normalizedWord);
    })
    .join(' ')
    .trim();
  const locationWithCountry = normalizedLocation.toLowerCase().includes('sri lanka')
    ? normalizedLocation
    : `${normalizedLocation}, Sri Lanka`;
  const queries = [normalizedLocation, locationWithCountry];

  if (
    cleanedTitle.length > 0 &&
    !normalizedLocation.toLowerCase().includes(cleanedTitle.toLowerCase())
  ) {
    queries.unshift(`${cleanedTitle}, ${locationWithCountry}`);
    queries.push(`${cleanedTitle}, Sri Lanka`);
  }

  return Array.from(new Set(queries.filter(query => query.trim().length > 0)));
};

const geocodeQuery = async (query: string) => {
  const cachedRequest = geocodeCache.get(query);

  if (cachedRequest) {
    return cachedRequest;
  }

  const request = (async () => {
    try {
      const response = await fetch(
        `${NOMINATIM_SEARCH_URL}?format=jsonv2&limit=1&countrycodes=lk&q=${encodeURIComponent(
          query,
        )}`,
        {
          headers: {
            Accept: 'application/json',
            'Accept-Language': 'en',
            'User-Agent': 'HomeRentalMobile/1.0',
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      const body = (await response.json()) as Array<{
        lat?: string;
        lon?: string;
      }>;
      const firstResult = body[0];

      if (!firstResult) {
        return null;
      }

      const latitude = Number(firstResult.lat);
      const longitude = Number(firstResult.lon);

      if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
        return null;
      }

      return {latitude, longitude};
    } catch (error) {
      return null;
    }
  })();

  geocodeCache.set(query, request);
  return request;
};

const geocodeLocation = async (locationText: string, title?: string) => {
  const queries = buildGeocodeQueries(locationText, title);

  for (const query of queries) {
    const result = await geocodeQuery(query);

    if (result) {
      return result;
    }
  }

  return null;
};

const resolveCoordinates = (
  property: Record<string, unknown>,
  locationText: string,
) => {
  const fallbackCoordinates = getCoordinatePreset(locationText);
  const latitude = toNumber(
    property.latitude ?? property.lat,
    fallbackCoordinates.latitude,
  );
  const longitude = toNumber(
    property.longitude ?? property.lng ?? property.lon ?? property.long,
    fallbackCoordinates.longitude,
  );

  if (
    (!isValidLatitude(latitude) || !isValidLongitude(longitude)) ||
    (latitude === 0 && longitude === 0)
  ) {
    return fallbackCoordinates;
  }

  return {latitude, longitude};
};

const shouldRefineCoordinates = (
  coordinates: {latitude: number; longitude: number},
  locationText: string,
) => {
  const preset = getCoordinatePreset(locationText);

  return (
    areCoordinatesClose(coordinates.latitude, preset.latitude) &&
    areCoordinatesClose(coordinates.longitude, preset.longitude)
  );
};

const normalizeStringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => String(item).trim())
    .filter(item => item.length > 0);
};

const normalizeProperty = async (
  property: Record<string, unknown>,
): Promise<PropertyRecord> => {
  const locationText = String(
    property.locationText ?? property.location_text ?? property.location ?? 'Colombo',
  );
  let coordinates = resolveCoordinates(property, locationText);

  if (shouldRefineCoordinates(coordinates, locationText)) {
    const geocodedCoordinates = await geocodeLocation(
      locationText,
      String(property.title ?? property.name ?? ''),
    );

    if (geocodedCoordinates) {
      coordinates = geocodedCoordinates;
    }
  }

  return {
    id: toNumber(property.id, 0),
    ownerId:
      property.ownerId === null || property.owner_id === null
        ? null
        : toNumber(property.ownerId ?? property.owner_id, 0),
    propertyCode: String(
      property.propertyCode ?? property.property_code ?? `PRO-${property.id ?? ''}`,
    ),
    title: String(property.title ?? property.name ?? 'Untitled Property'),
    propertyType: String(property.propertyType ?? property.property_type ?? 'House'),
    listingType: String(property.listingType ?? property.listing_type ?? 'For Rent'),
    monthlyRent: toNullableNumber(
      property.monthlyRent ??
        property.monthly_rent ??
        property.rentAmount ??
        property.rent_amount ??
        property.salary,
    ),
    availableFrom: normalizeOptionalDate(
      property.availableFrom ?? property.available_from,
    ),
    availableTo: normalizeOptionalDate(
      property.availableTo ?? property.available_to,
    ),
    bedrooms: toNumber(property.bedrooms, 0),
    bathrooms: toNumber(property.bathrooms, 0),
    amenities: normalizeStringArray(property.amenities),
    locationText,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    galleryUrls: normalizeStringArray(
      property.galleryUrls ?? property.gallery_urls,
    ),
    description: String(property.description ?? ''),
    createdAt:
      property.createdAt === null || property.created_at === null
        ? null
        : String(property.createdAt ?? property.created_at),
    updatedAt:
      property.updatedAt === null || property.updated_at === null
        ? null
        : String(property.updatedAt ?? property.updated_at),
  };
};

const resolveSaveCoordinates = async (params: SavePropertyParams) => {
  if (
    typeof params.latitude === 'number' &&
    typeof params.longitude === 'number' &&
    isValidLatitude(params.latitude) &&
    isValidLongitude(params.longitude)
  ) {
    return params;
  }

  const geocodedCoordinates = await geocodeLocation(
    params.locationText,
    params.title,
  );

  if (!geocodedCoordinates) {
    throw new Error(
      'Unable to find the exact property location. Add a more specific address or enter latitude and longitude.',
    );
  }

  return {
    ...params,
    latitude: geocodedCoordinates.latitude,
    longitude: geocodedCoordinates.longitude,
  };
};

const request = async <T>(
  path: string,
  token: string,
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
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
    });
  } catch (error) {
    throw new Error(
      'Cannot reach the properties backend. Check the API base URL and backend server.',
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

const requestPublic = async <T>(
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
      'Cannot reach the properties backend. Check the API base URL and backend server.',
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

export const getActiveProperties = async () => {
  const data = await requestPublic<{properties: Record<string, unknown>[]}>(
    '/api/properties',
    {
      method: 'GET',
    },
    'Unable to load properties.',
  );

  return Promise.all(data.properties.map(normalizeProperty));
};

export const getMyProperties = async (token: string) => {
  const data = await request<{properties: Record<string, unknown>[]}>(
    '/api/properties/my',
    token,
    {
      method: 'GET',
    },
    'Unable to load your properties.',
  );

  return Promise.all(data.properties.map(normalizeProperty));
};

export const createProperty = async (
  token: string,
  params: SavePropertyParams,
) => {
  const payload = await resolveSaveCoordinates(params);
  const data = await request<{property: Record<string, unknown>}>(
    '/api/properties',
    token,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    'Unable to create your property.',
  );

  return normalizeProperty(data.property);
};

export const updateProperty = async (
  token: string,
  propertyId: number,
  params: SavePropertyParams,
) => {
  const payload = await resolveSaveCoordinates(params);
  const data = await request<{property: Record<string, unknown>}>(
    `/api/properties/${propertyId}`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    'Unable to update your property.',
  );

  return normalizeProperty(data.property);
};
