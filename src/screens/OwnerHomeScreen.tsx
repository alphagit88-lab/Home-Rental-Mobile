import React from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {useOwnerProperties} from '../hooks/useOwnerProperties';
import {useResponsive} from '../hooks/useResponsive';
import {colors, fonts, radii, spacing} from '../theme';
import MenuIcon from '../assets/images/menu 1.svg';
import ProfilePic from '../assets/images/profile_pic.svg';
import HeroBackground from '../assets/images/Untitled design (3) 1.svg';
import PlayIcon from '../assets/images/20 1.svg';

type OwnerHomeScreenProps = {
  activeTab: AppTab;
  onViewBookingsPress?: () => void;
  onTabPress: (tab: AppTab) => void;
};

type DashboardItem = {
  id: string;
  subtitle: string;
  title: string;
};

const recentBookings: DashboardItem[] = [];

export const OwnerHomeScreen: React.FC<OwnerHomeScreenProps> = ({
  activeTab,
  onViewBookingsPress,
  onTabPress,
}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const topInset = Platform.OS === 'android' ? spacing.xs : spacing.md;
  const {
    errorMessage: propertyErrorMessage,
    loading: propertiesLoading,
    properties,
  } = useOwnerProperties();
  const propertyItems: DashboardItem[] = properties
    .slice(0, 3)
    .map(property => ({
      id: `property-${property.id}`,
      title: property.title,
      subtitle: property.propertyCode,
    }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: responsive.horizontalPadding,
              paddingTop: topInset,
            },
          ]}
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.contentWidth,
              {maxWidth: responsive.maxContentWidth},
            ]}>
            <View style={styles.headerRow}>
              <Pressable
                accessibilityRole="button"
                onPress={home.onMenuPress}
                style={styles.iconButton}>
                <MenuIcon height={22} width={32} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={home.onProfilePress}
                style={styles.profileButton}>
                <Text style={styles.profileLabel}>{`Hello ${home.userName}.`}</Text>
                <View style={styles.profileImageWrap}>
                  <ProfilePic height="100%" width="100%" />
                </View>
              </Pressable>
            </View>

            <View
              style={[
                styles.heroCard,
                {height: responsive.isTablet ? 290 : 234},
              ]}>
              <HeroBackground
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                style={styles.heroImage}
                width="100%"
              />
              <View style={styles.heroOverlay} />

              <View style={styles.heroContent}>
                <Text
                  style={[
                    styles.heroGreeting,
                    {
                      fontSize: responsive.isTablet ? 28 : 22,
                      lineHeight: responsive.isTablet ? 34 : 28,
                    },
                  ]}>
                  {`Hello, ${home.userName}.`}
                </Text>
                <Text
                  style={[
                    styles.heroTitle,
                    {fontSize: responsive.isTablet ? 22 : 16},
                  ]}>
                  Welcome to Home Rent
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={onViewBookingsPress ?? (() => onTabPress('bookings'))}
                  style={({pressed}) => [
                    styles.heroButton,
                    pressed ? styles.pressed : null,
                  ]}>
                  <Text style={styles.heroButtonText}>View Bookings</Text>
                </Pressable>
              </View>
            </View>

            <DashboardSection
              emptyMessage="Recent bookings will appear here when booking data is available."
              footerLabel="Bookings"
              items={recentBookings}
              onItemPress={() => onTabPress('bookings')}
              onViewAllPress={() => onTabPress('bookings')}
              title="Recent Bookings"
            />

            <DashboardSection
              emptyMessage={
                propertyErrorMessage ?? 'You have not added any properties yet.'
              }
              footerLabel="Properties"
              items={propertyItems}
              loading={propertiesLoading}
              onItemPress={() => onTabPress('properties')}
              onViewAllPress={() => onTabPress('properties')}
              title="My Properties"
            />
          </View>
        </ScrollView>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
};

type DashboardSectionProps = {
  emptyMessage?: string;
  footerLabel: string;
  items: DashboardItem[];
  loading?: boolean;
  onItemPress: () => void;
  onViewAllPress: () => void;
  title: string;
};

const DashboardSection: React.FC<DashboardSectionProps> = ({
  emptyMessage,
  footerLabel,
  items,
  loading = false,
  onItemPress,
  onViewAllPress,
  title,
}) => {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>

        <Pressable
          accessibilityRole="button"
          onPress={onViewAllPress}
          style={({pressed}) => [
            styles.viewAllButton,
            pressed ? styles.pressed : null,
          ]}>
          <Text style={styles.viewAllText}>View all</Text>
          <View style={styles.playIconCircle}>
            <View style={styles.playIconGlyphWrap}>
              <PlayIcon height={10} style={styles.playIconRight} width={10} />
            </View>
          </View>
        </Pressable>
      </View>

      <View style={styles.sectionItems}>
        {loading ? (
          <Text style={styles.sectionStateText}>
            Loading your {footerLabel.toLowerCase()}...
          </Text>
        ) : items.length === 0 ? (
          <Text style={styles.sectionStateText}>
            {emptyMessage ?? `No ${footerLabel.toLowerCase()} yet.`}
          </Text>
        ) : (
          items.map(item => (
            <DashboardListItem
              key={item.id}
              onPress={onItemPress}
              subtitle={item.subtitle}
              title={item.title}
            />
          ))
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onViewAllPress}
        style={({pressed}) => [
          styles.sectionFooterButton,
          pressed ? styles.pressed : null,
        ]}>
        <Text style={styles.sectionFooterText}>
          View all <Text style={styles.sectionFooterAccent}>{footerLabel}</Text>
        </Text>
      </Pressable>
    </View>
  );
};

type DashboardListItemProps = {
  onPress: () => void;
  subtitle: string;
  title: string;
};

const DashboardListItem: React.FC<DashboardListItemProps> = ({
  onPress,
  subtitle,
  title,
}) => {
  return (
    <View style={styles.listItem}>
      <View style={styles.listItemTextWrap}>
        <Text numberOfLines={1} style={styles.listItemTitle}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.listItemSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({pressed}) => [
          styles.listItemButton,
          pressed ? styles.pressed : null,
        ]}>
        <Text style={styles.listItemButtonText}>View</Text>
        <View style={styles.playIconCircle}>
          <View style={styles.playIconGlyphWrap}>
            <PlayIcon height={10} style={styles.playIconRight} width={10} />
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 146,
    alignItems: 'center',
  },
  contentWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  profileLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  heroCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 17, 15, 0.38)',
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  heroGreeting: {
    color: colors.white,
    fontFamily: fonts.heavy,
    textAlign: 'center',
    marginBottom: 2,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  heroButton: {
    width: '100%',
    minHeight: 56,
    backgroundColor: '#FFF2DF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonText: {
    color: colors.primary,
    fontFamily: fonts.heavy,
    fontSize: 16,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  sectionCard: {
    backgroundColor: '#FCF4E9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5D4BF',
    padding: spacing.sm + 4,
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  viewAllButton: {
    minHeight: 32,
    borderRadius: radii.pill,
    backgroundColor: '#252525',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  viewAllText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  playIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconGlyphWrap: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  playIconRight: {
    transform: [{rotate: '-90deg'}],
    marginLeft: 1,
  },
  sectionItems: {
    gap: spacing.sm,
  },
  sectionStateText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
  },
  listItem: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 4,
    gap: spacing.sm,
  },
  listItemTextWrap: {
    flex: 1,
  },
  listItemTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  listItemSubtitle: {
    color: '#E3E9E6',
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  listItemButton: {
    minHeight: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: spacing.sm + 4,
    paddingRight: spacing.sm,
  },
  listItemButtonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  sectionFooterButton: {
    alignSelf: 'center',
    marginTop: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sectionFooterText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  sectionFooterAccent: {
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  pressed: {
    opacity: 0.86,
  },
});
