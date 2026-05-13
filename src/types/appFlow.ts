import {RentalRole} from '../services/rentalAuth';

export type DashboardVariant = 'owner' | 'serviceProvider' | 'standard';
export const dashboardVariantMenuOrder: DashboardVariant[] = [
  'standard',
  'owner',
  'serviceProvider',
];

export const getDashboardVariantsForRole = (
  role?: RentalRole | null,
): DashboardVariant[] => {
  if (role) {
    return dashboardVariantMenuOrder;
  }

  return ['standard'];
};

export const getDashboardVariantForRole = (
  role: RentalRole,
): DashboardVariant => {
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
    return 'service provider';
  }

  return 'tenant';
};

export const formatRentalRoleLabel = (role?: RentalRole | null) => {
  if (role === undefined || role === null) {
    return 'Home Rental Account';
  }

  return 'Home Rental Account';
};
