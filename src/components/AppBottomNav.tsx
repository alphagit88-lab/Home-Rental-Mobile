import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, fonts, spacing} from '../theme';
import DashboardIcon from '../assets/images/1 235.svg';
import PropertiesIcon from '../assets/images/1 236.svg';
import BookingsIcon from '../assets/images/1 237.svg';
import AccountIcon from '../assets/images/1 239.svg';

export type AppTab = 'dashboard' | 'properties' | 'bookings' | 'account';

type AppBottomNavProps = {
  activeTab: AppTab;
  labels?: Partial<Record<AppTab, string>>;
  onTabPress: (tab: AppTab) => void;
};

export const AppBottomNav: React.FC<AppBottomNavProps> = ({
  activeTab,
  labels,
  onTabPress,
}) => {
  return (
    <View style={styles.bottomNav}>
      <BottomNavItem
        active={activeTab === 'dashboard'}
        icon={<DashboardIcon height={22} width={22} />}
        label={labels?.dashboard ?? 'Dashboard'}
        onPress={() => onTabPress('dashboard')}
      />
      <BottomNavItem
        active={activeTab === 'properties'}
        icon={<PropertiesIcon height={22} width={22} />}
        label={labels?.properties ?? 'Properties'}
        onPress={() => onTabPress('properties')}
      />
      <BottomNavItem
        active={activeTab === 'bookings'}
        icon={<BookingsIcon height={22} width={22} />}
        label={labels?.bookings ?? 'Bookings'}
        onPress={() => onTabPress('bookings')}
      />
      <BottomNavItem
        active={activeTab === 'account'}
        icon={<AccountIcon height={22} width={22} />}
        label={labels?.account ?? 'Account'}
        onPress={() => onTabPress('account')}
      />
    </View>
  );
};

type BottomNavItemProps = {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

const BottomNavItem: React.FC<BottomNavItemProps> = ({
  active,
  icon,
  label,
  onPress,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.navItem, active ? styles.navItemActive : null]}>
      <View
        style={[styles.navIconCircle, active ? styles.navIconActive : null]}>
        {icon}
      </View>
      <Text style={[styles.navLabel, active ? styles.navLabelActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  navItemActive: {
    backgroundColor: colors.white,
    paddingBottom: spacing.md + 2,
  },
  navIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  navIconActive: {
    borderColor: colors.primary,
  },
  navLabel: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  navLabelActive: {
    color: colors.primary,
  },
});
