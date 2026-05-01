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
import {PropertyMapCard} from '../components/PropertyMapCard';
import {useHomeScreen} from '../hooks/useHomeScreen';
import {useResponsive} from '../hooks/useResponsive';
import {PropertyRecord} from '../services/properties';
import {colors, fonts, spacing} from '../theme';
import {
  formatPropertyAvailability,
  formatPropertyRent,
} from '../utils/propertyPresentation';

type OwnerPropertyDetailsScreenProps = {
  activeTab: AppTab;
  onBackPress: () => void;
  onEditPropertyPress: () => void;
  onTabPress: (tab: AppTab) => void;
  property: PropertyRecord;
};

type StatColumnProps = {
  label: string;
  suffix?: string;
  value: string;
};

export const OwnerPropertyDetailsScreen: React.FC<
  OwnerPropertyDetailsScreenProps
> = ({activeTab, onBackPress, onEditPropertyPress, onTabPress, property}) => {
  const responsive = useResponsive();
  const home = useHomeScreen();
  const topInset = Platform.OS === 'android' ? spacing.xs : spacing.md;
  const amenities = property.amenities;

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
                {property.propertyCode}
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
                <Text style={styles.heroTitle}>{property.title}</Text>
                <View style={styles.locationRow}>
                  <MapMarkerIcon height={18} width={18} />
                  <Text style={styles.locationText}>{property.locationText}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsCard}>
              <Text style={styles.propertyName}>{property.title}</Text>
              <Text style={styles.descriptionText}>
                {property.description || 'No description has been added for this property yet.'}
              </Text>

              <InfoRow
                label="Monthly Rent"
                value={formatPropertyRent(property.monthlyRent)}
              />
              <InfoRow
                label="Available"
                value={formatPropertyAvailability(
                  property.availableFrom,
                  property.availableTo,
                )}
              />
              <InfoRow
                label="Status"
                value={property.isActive ? 'Active' : 'Inactive'}
              />

              <PropertyMapCard
                latitude={property.latitude}
                locationLabel={property.locationText}
                longitude={property.longitude}
                title={property.title}
              />

              <Text style={styles.includeTitle}>Amenities</Text>
              {amenities.length > 0 ? (
                amenities.map(item => (
                  <Text key={item} style={styles.includeText}>
                    {`- ${item}`}
                  </Text>
                ))
              ) : (
                <Text style={styles.includeEmptyText}>No amenities added yet.</Text>
              )}

              <View style={styles.statsRow}>
                <StatColumn label="BEDROOMS" value={String(property.bedrooms)} />
                <StatColumn label="BATHROOMS" value={String(property.bathrooms)} />
                <StatColumn label="TYPE" value={property.propertyType} />
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={onEditPropertyPress}
                style={styles.editButton}>
                <Text style={styles.editButtonText}>EDIT PROPERTY</Text>
              </Pressable>

              <View style={styles.listingTag}>
                <Text style={styles.listingTagText}>{property.listingType}</Text>
              </View>
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
      <Text numberOfLines={1} style={styles.statValue}>
        {value}
        {suffix ? <Text style={styles.statSuffix}>{suffix}</Text> : null}
      </Text>
    </View>
  );
};

const InfoRow: React.FC<{label: string; value: string}> = ({label, value}) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
    right: spacing.lg,
    bottom: spacing.lg,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 28,
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
    marginBottom: spacing.md,
  },
  infoRow: {
    marginBottom: spacing.sm,
  },
  infoLabel: {
    color: '#B0B0B0',
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: 2,
  },
  infoValue: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  includeTitle: {
    color: '#B0B0B0',
    fontFamily: fonts.medium,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  includeText: {
    color: '#8B8B8B',
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  includeEmptyText: {
    color: '#8B8B8B',
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
  listingTag: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: '#F4B533',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listingTagText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
});
