export type RentalServiceRequestStatus =
  | 'pending'
  | 'accepted'
  | 'cancelled'
  | 'completed';

export type ProviderResponseStatus = 'accepted' | 'rejected';

export type ServiceCategoryRecord = {
  createdAt: string | null;
  description: string | null;
  id: number;
  isActive: boolean;
  name: string;
  updatedAt: string | null;
};

export type ProviderServiceAreaRecord = {
  areaRadiusKm: number | null;
  city: string;
  country: string;
  createdAt: string | null;
  id: number;
  latitude: number | null;
  longitude: number | null;
  updatedAt: string | null;
};

export type RentalServiceRequestRecord = {
  bookingCode: string;
  bookingStatus: string | null;
  checkIn: string;
  checkOut: string;
  createdAt: string | null;
  distanceKm: number | null;
  guestCount: number;
  id: number;
  latitude: number;
  locationText: string;
  longitude: number;
  ownerEmail: string | null;
  ownerId: number;
  ownerName: string | null;
  propertyId: number;
  propertyTitle: string;
  providerResponseStatus: ProviderResponseStatus | null;
  requestStatus: RentalServiceRequestStatus;
  responseNotes: string | null;
  rentalBookingId: number;
  serviceAreaCity: string | null;
  serviceAreaId: number | null;
  serviceCategoryDescription: string | null;
  serviceCategoryId: number;
  serviceCategoryName: string;
  serviceProviderEmail: string | null;
  serviceProviderId: number | null;
  serviceProviderName: string | null;
  serviceProviderPhone: string | null;
  tenantEmail: string | null;
  tenantId: number;
  tenantName: string | null;
  tenantNotes: string | null;
  updatedAt: string | null;
};

export type ProviderServiceRequestBucket = 'assigned' | 'nearby';

export type ProviderServiceRequestMapMarker = {
  bookingCode: string;
  bucket: ProviderServiceRequestBucket;
  bucketLabel?: string | null;
  distanceKm: number | null;
  id: number;
  latitude: number;
  locationText: string;
  longitude: number;
  ownerName: string | null;
  propertyTitle: string;
  serviceCategoryId: number;
  serviceCategoryName: string;
  status: RentalServiceRequestStatus;
  tenantName: string | null;
};
