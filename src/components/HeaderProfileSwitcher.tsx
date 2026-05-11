import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  setDashboardModeVariant,
  useDashboardMode,
} from '../services/dashboardMode';
import {colors, fonts, radii, spacing} from '../theme';
import {
  DashboardVariant,
  formatDashboardVariantGreeting,
  formatDashboardVariantLabel,
} from '../types/appFlow';
import ProfilePic from '../assets/images/profile_pic.svg';

const getVariantDescription = (variant: DashboardVariant) => {
  if (variant === 'owner') {
    return 'Manage listings and owner bookings';
  }

  if (variant === 'serviceProvider') {
    return 'Review jobs and service requests';
  }

  return 'Browse homes and book properties';
};

export const HeaderProfileSwitcher: React.FC = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const {
    activeVariant,
    availableVariants,
    canSwitchVariant,
    isSwitching,
    pendingVariant,
  } = useDashboardMode();

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
          if (canSwitchVariant && !isSwitching) {
            setMenuVisible(current => !current);
          }
        }}
        disabled={isSwitching}
        style={({pressed}) => [
          styles.profileButton,
          pressed ? styles.profileButtonPressed : null,
        ]}>
        <View style={styles.profileTextWrap}>
          <Text style={styles.profileLabel}>
            {`Hello ${formatDashboardVariantGreeting(activeVariant)}.`}
          </Text>
          {isSwitching && pendingVariant ? (
            <View style={styles.switchingRow}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text numberOfLines={1} style={styles.switchingText}>
                {`Switching to ${formatDashboardVariantLabel(pendingVariant)}...`}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.profileImageWrap}>
          <ProfilePic height="100%" width="100%" />
        </View>
      </Pressable>

      {menuVisible ? (
        <View style={styles.menu}>
          <Text style={styles.menuTitle}>Switch mode</Text>

          {availableVariants.map(variant => {
            const active = variant === activeVariant;

            return (
              <Pressable
                accessibilityRole="button"
                key={variant}
                onPress={() => {
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
                  {formatDashboardVariantLabel(variant)}
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
  },
  profileLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 13,
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
  menu: {
    position: 'absolute',
    top: 56,
    right: 0,
    width: 228,
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
  menuTitle: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingTop: 2,
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
