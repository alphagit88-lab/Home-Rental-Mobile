import {RentalRole} from '../services/rentalAuth';

export type DashboardVariant = 'owner' | 'serviceProvider' | 'standard';
export const dashboardVariantMenuOrder: DashboardVariant[] = [
  'standard',
  'owner',
  'serviceProvider',
];

const dashboardVariantLabels: Record<DashboardVariant, string> = {
  standard: 'Tenant',
  owner: 'Owner',
  serviceProvider: 'Service Provider',
};

const dashboardVariantGreetings: Record<DashboardVariant, string> = {
  standard: 'tenant',
  owner: 'owner',
  serviceProvider: 'service provider',
};

const rentalRoleLabels: Record<RentalRole, string> = {
  tenant: 'Tenant',
  owner: 'Owner',
  service_provider: 'Service Provider',
};

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
  if (role === 'owner') {
    return 'owner';
  }

  if (role === 'service_provider') {
    return 'serviceProvider';
  }

  return 'standard';
};

export const formatDashboardVariantLabel = (variant: DashboardVariant) =>
  dashboardVariantLabels[variant];

export const formatDashboardVariantGreeting = (variant: DashboardVariant) =>
  dashboardVariantGreetings[variant];

export const formatRentalRoleLabel = (role?: RentalRole | null) => {
  if (role === undefined || role === null) {
    return 'Home Rental Account';
  }

  return rentalRoleLabels[role];
};
