import {RentalRole} from '../services/rentalAuth';

export type DashboardVariant = 'owner' | 'serviceProvider' | 'standard';

export const getDashboardVariantForRole = (
  role: RentalRole,
): DashboardVariant => {
  if (role === 'owner') {
    return 'owner';
  }

  if (role === 'service_provider') {
    return 'serviceProvider';
  }

  return 'standard';
};

export const formatRentalRoleLabel = (role?: RentalRole | null) => {
  if (role === 'owner') {
    return 'Property Owner';
  }

  if (role === 'service_provider') {
    return 'Service Provider';
  }

  return 'Tenant';
};
