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
import MenuIcon from '../assets/images/menu 1.svg';
import ProfilePic from '../assets/images/profile_pic.svg';
import HeroImage from '../assets/images/image.svg';
import LeftArrowIcon from '../assets/images/left-arrow 2.svg';
import MapMarkerIcon from '../assets/images/mdi_map-marker.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {useResponsive} from '../hooks/useResponsive';
import {colors, fonts, spacing} from '../theme';

type OwnerPropertyDetailsScreenProps = {
  activeTab: AppTab;
  onBackPress: () => void;
  onEditPropertyPress: () => void;
  onTabPress: (tab: AppTab) => void;
  propertyTitle: string;
};

type StatColumnProps = {
  label: string;
  suffix: string;
  value: string;
};

export const OwnerPropertyDetailsScreen: React.FC<
  OwnerPropertyDetailsScreenProps
> = ({
  activeTab,
  onBackPress,
  onEditPropertyPress,
  onTabPress,
  propertyTitle,
}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const topInset = Platform.OS === 'android' ? spacing.xs : spacing.md;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: topInset,
            },
          ]}
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.contentWidth,
              {maxWidth: responsive.maxContentWidth},
            ]}>
            <View
              style={[
                styles.headerRow,
                {paddingHorizontal: responsive.horizontalPadding},
              ]}>
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

            <View style={styles.titleRow}>
              <Pressable
                accessibilityRole="button"
                hitSlop={10}
                onPress={onBackPress}
                style={[
                  styles.titleBackButton,
                  {left: responsive.horizontalPadding},
                ]}>
                <LeftArrowIcon height={18} width={18} />
              </Pressable>

              <Text numberOfLines={1} style={styles.titleText}>
                {propertyTitle}
              </Text>
            </View>

            <View style={styles.heroWrap}>
              <View style={styles.heroImageWrap}>
                <HeroImage
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                  style={styles.heroImage}
                  width="100%"
                />
                <View style={styles.heroOverlay} />
              </View>

              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>Luxury House</Text>
                <View style={styles.locationRow}>
                  <MapMarkerIcon height={18} width={18} />
                  <Text style={styles.locationText}>Colombo</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsCard}>
              <Text style={styles.propertyName}>{propertyTitle}</Text>
              <Text style={styles.descriptionText}>
                Dreamland beach there are white coral rocks that surround the
                beach, this creates a beautiful view of its own.
              </Text>

              <Text style={styles.includeTitle}>Include</Text>
              <Text style={styles.includeText}>• Lorem</Text>
              <Text style={styles.includeText}>• Lorem Ipsum Lorem</Text>
              <Text style={styles.includeText}>• Lorem Ipsum</Text>

              <View style={styles.statsRow}>
                <StatColumn label="PRICE" suffix="" value="LKR 25K" />
                <StatColumn label="RATING" suffix="/10" value="8.9" />
                <StatColumn label="DURATION" suffix="hours" value="24" />
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={onEditPropertyPress}
                style={styles.editButton}>
                <Text style={styles.editButtonText}>EDIT PROPERTY</Text>
              </Pressable>

              <Pressable accessibilityRole="button" style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>DELETE PROPERTY</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
};

const StatColumn: React.FC<StatColumnProps> = ({label, suffix, value}) => {
  return (
    <View style={styles.statColumn}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {value}
        {suffix ? <Text style={styles.statSuffix}>{suffix}</Text> : null}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 138,
  },
  contentWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
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
  titleRow: {
    minHeight: 46,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8E2DA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 0,
  },
  titleBackButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleText: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
    paddingHorizontal: spacing.xl + spacing.sm,
  },
  heroWrap: {
    position: 'relative',
  },
  heroImageWrap: {
    height: 262,
    overflow: 'hidden',
    backgroundColor: '#DDD5CE',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 18, 16, 0.16)',
  },
  heroTextWrap: {
    position: 'absolute',
    left: spacing.lg,
    bottom: spacing.lg,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 30,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  detailsCard: {
    marginTop: -22,
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + 4,
  },
  propertyName: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    color: '#B2B2B2',
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.lg + 2,
  },
  includeTitle: {
    color: '#B0B0B0',
    fontFamily: fonts.medium,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  includeText: {
    color: '#C3C3C3',
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  statColumn: {
    flex: 1,
  },
  statLabel: {
    color: '#B8B8B8',
    fontFamily: fonts.medium,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  statValue: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  statSuffix: {
    color: '#9C9C9C',
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  editButton: {
    minHeight: 58,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  editButtonText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  deleteButton: {
    minHeight: 58,
    borderRadius: 10,
    backgroundColor: '#F4B533',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
});
