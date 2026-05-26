import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  setDashboardModeVariant,
  useDashboardMode,
} from '../services/dashboardMode';
import {getAuthSession} from '../services/authSession';
import {colors, fonts, radii, spacing} from '../theme';
import {
  DashboardVariant,
  dashboardVariantMenuOrder,
  formatDashboardVariantLabel,
} from '../types/appFlow';

const hostProfileImage = require('../assets/images/profile-host.png');
const tenantProfileImage = require('../assets/images/profile-tenant.png');
const serviceProfileImage = require('../assets/images/profile-service.png');
const genericProfileImage = require('../assets/images/profile-generic.png');

const getVariantDescription = (variant: DashboardVariant) => {
  if (variant === 'owner') {
    return 'Manage listings and owner bookings';
  }

  if (variant === 'serviceProvider') {
    return 'Review jobs and service requests';
  }

  return 'Browse homes and book properties';
};

const getVariantStatusLabel = (variant: DashboardVariant) => {
  return `(Logged as ${formatDashboardVariantLabel(variant)})`;
};

const getVariantSwitcherLabel = (variant: DashboardVariant) =>
  formatDashboardVariantLabel(variant);

const getVariantProfileImage = (variant: DashboardVariant) => {
  if (variant === 'owner') {
    return hostProfileImage;
  }

  if (variant === 'serviceProvider') {
    return serviceProfileImage;
  }

  return tenantProfileImage;
};

export const HeaderProfileSwitcher: React.FC = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const {activeVariant, isSwitching, pendingVariant} = useDashboardMode();
  const userDisplayName = getAuthSession()?.user.name.trim() || 'Guest';

  useEffect(() => {
    if (isSwitching) {
      setMenuVisible(false);
    }
  }, [isSwitching]);

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          if (!isSwitching) {
            setMenuVisible(current => !current);
          }
        }}
        disabled={isSwitching}
        style={({pressed}) => [
          styles.profileButton,
          pressed ? styles.profileButtonPressed : null,
        ]}>
        <View style={styles.profileTextWrap}>
          <Text numberOfLines={1} style={styles.profileName}>
            {userDisplayName}
          </Text>
          <Text numberOfLines={1} style={styles.profileRoleText}>
            {getVariantStatusLabel(activeVariant)}
          </Text>
          {isSwitching && pendingVariant ? (
            <View style={styles.switchingRow}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text numberOfLines={1} style={styles.switchingText}>
                {`Switching to ${getVariantSwitcherLabel(pendingVariant)}...`}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.profileImageWrap}>
          <Image
            source={getVariantProfileImage(activeVariant)}
            style={styles.profileImage}
          />
        </View>
      </Pressable>

      {menuVisible ? (
        <View style={styles.menu}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Switch mode</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setMenuVisible(false)}
              style={({pressed}) => [
                styles.menuHeaderArrowButton,
                pressed ? styles.menuItemPressed : null,
              ]}>
              <Image source={genericProfileImage} style={styles.menuHeaderArrow} />
            </Pressable>
          </View>

          {dashboardVariantMenuOrder.map(variant => {
            const active = variant === activeVariant;

            return (
              <Pressable
                accessibilityRole="button"
                disabled={active}
                key={variant}
                onPress={() => {
                  if (active) {
                    return;
                  }

                  setDashboardModeVariant(variant);
                  setMenuVisible(false);
                }}
                style={({pressed}) => [
                  styles.menuItem,
                  active ? styles.menuItemActive : null,
                  pressed ? styles.menuItemPressed : null,
                ]}>
                <Text
                  style={[
                    styles.menuItemTitle,
                    active ? styles.menuItemTitleActive : null,
                  ]}>
                  {getVariantSwitcherLabel(variant)}
                </Text>
                <Text
                  style={[
                    styles.menuItemDescription,
                    active ? styles.menuItemDescriptionActive : null,
                  ]}>
                  {getVariantDescription(variant)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-end',
    zIndex: 30,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileButtonPressed: {
    opacity: 0.88,
  },
  profileTextWrap: {
    alignItems: 'flex-end',
    maxWidth: 156,
  },
  profileName: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 16,
  },
  profileRoleText: {
    color: '#8D877F',
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
  },
  switchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
    maxWidth: 146,
  },
  switchingText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  profileImageWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: '#ECECEC',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  menu: {
    position: 'absolute',
    top: 56,
    right: 0,
    width: 240,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    padding: spacing.sm,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 10},
    elevation: 12,
    borderWidth: 1,
    borderColor: '#E8DDD0',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingTop: 2,
  },
  menuTitle: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  menuHeaderArrowButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuHeaderArrow: {
    width: 12,
    height: 10,
  },
  menuItem: {
    borderRadius: 14,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  menuItemActive: {
    backgroundColor: colors.primary,
  },
  menuItemPressed: {
    opacity: 0.88,
  },
  menuItemTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    fontSize: 14,
    marginBottom: 2,
  },
  menuItemTitleActive: {
    color: colors.white,
  },
  menuItemDescription: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  menuItemDescriptionActive: {
    color: '#E4F0EA',
  },
});
