import {RentalRole} from '../services/rentalAuth';

export type DashboardVariant = 'owner' | 'serviceProvider' | 'standard';

export const getDashboardVariantsForRole = (
  role?: RentalRole | null,
): DashboardVariant[] => {
  if (role === 'owner') {
    return ['standard', 'owner'];
  }

  if (role === 'service_provider') {
    return ['serviceProvider'];
  }

  return ['standard'];
};

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

export const formatDashboardVariantLabel = (variant: DashboardVariant) => {
  if (variant === 'owner') {
    return 'Owner';
  }

  if (variant === 'serviceProvider') {
    return 'Service Provider';
  }

  return 'Tenant';
};

export const formatDashboardVariantGreeting = (variant: DashboardVariant) => {
  if (variant === 'owner') {
    return 'owner';
  }

  if (variant === 'serviceProvider') {
    return 'provider';
  }

  return 'tenant';
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
