import {useSyncExternalStore} from 'react';
import {
  DashboardVariant,
  getDashboardVariantForRole,
  getDashboardVariantsForRole,
} from '../types/appFlow';
import {RentalRole} from './rentalAuth';

type DashboardModeSnapshot = {
  activeVariant: DashboardVariant;
  availableVariants: DashboardVariant[];
  canSwitchVariant: boolean;
  isSwitching: boolean;
  pendingVariant: DashboardVariant | null;
};

const buildSnapshot = (
  activeVariant: DashboardVariant,
  availableVariants: DashboardVariant[],
  isSwitching = false,
  pendingVariant: DashboardVariant | null = null,
): DashboardModeSnapshot => ({
  activeVariant,
  availableVariants,
  canSwitchVariant: availableVariants.length > 1,
  isSwitching,
  pendingVariant,
});

let snapshot: DashboardModeSnapshot = buildSnapshot('standard', ['standard']);
let switchTimeout: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<() => void>();

const hasSameVariants = (
  first: DashboardVariant[],
  second: DashboardVariant[],
) =>
  first.length === second.length &&
  first.every((variant, index) => variant === second[index]);

const hasSameSnapshot = (
  first: DashboardModeSnapshot,
  second: DashboardModeSnapshot,
) =>
  first.activeVariant === second.activeVariant &&
  hasSameVariants(first.availableVariants, second.availableVariants) &&
  first.canSwitchVariant === second.canSwitchVariant &&
  first.isSwitching === second.isSwitching &&
  first.pendingVariant === second.pendingVariant;

const getSnapshot = () => snapshot;

const clearSwitchTimeout = () => {
  if (switchTimeout !== null) {
    clearTimeout(switchTimeout);
    switchTimeout = null;
  }
};

const updateSnapshot = (nextSnapshot: DashboardModeSnapshot) => {
  if (hasSameSnapshot(snapshot, nextSnapshot)) {
    return;
  }

  snapshot = nextSnapshot;
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const useDashboardMode = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const configureDashboardMode = (
  role?: RentalRole | null,
  preferredVariant?: DashboardVariant,
) => {
  clearSwitchTimeout();

  const nextAvailableVariants = getDashboardVariantsForRole(role);
  const defaultVariant =
    role == null ? 'standard' : getDashboardVariantForRole(role);
  const nextActiveVariant =
    preferredVariant && nextAvailableVariants.includes(preferredVariant)
      ? preferredVariant
      : nextAvailableVariants.includes(defaultVariant)
        ? defaultVariant
        : nextAvailableVariants[0] ?? 'standard';

  updateSnapshot(buildSnapshot(nextActiveVariant, nextAvailableVariants));
};

export const setDashboardModeVariant = (variant: DashboardVariant) => {
  if (
    !snapshot.availableVariants.includes(variant) ||
    snapshot.activeVariant === variant ||
    snapshot.isSwitching
  ) {
    return;
  }

  clearSwitchTimeout();
  updateSnapshot(
    buildSnapshot(
      snapshot.activeVariant,
      snapshot.availableVariants,
      true,
      variant,
    ),
  );

  switchTimeout = setTimeout(() => {
    switchTimeout = null;
    updateSnapshot(buildSnapshot(variant, snapshot.availableVariants));
  }, 420);
};
