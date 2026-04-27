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
import HeartIcon from '../assets/images/heart 1.svg';
import MapMarkerIcon from '../assets/images/mdi_map-marker.svg';
import HeroImage from '../assets/images/image.svg';
import BackButtonGraphic from '../assets/images/Group 11.svg';
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {PropertyMapCard} from '../components/PropertyMapCard';
import {useResponsive} from '../hooks/useResponsive';
import {PropertyRecord} from '../services/properties';
import {colors, fonts, spacing} from '../theme';
import {formatIsoDateInput} from '../utils/dateInput';
import {
  formatPropertyAvailability,
  hasPropertyBookableStayDates,
  formatPropertyRent,
} from '../utils/propertyPresentation';

type PropertyDetailsScreenProps = {
  activeTab: AppTab;
  onBack: () => void;
  onBookNow: () => void;
  onTabPress: (tab: AppTab) => void;
  property: PropertyRecord;
};

type StatColumnProps = {
  label: string;
  value: string;
};

export const PropertyDetailsScreen: React.FC<PropertyDetailsScreenProps> = ({
  activeTab,
  onBack,
  onBookNow,
  onTabPress,
  property,
}) => {
  const responsive = useResponsive();
  const topOverlayOffset =
    Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 18;
  const amenities = property.amenities;
  const description =
    property.description ||
    `${property.propertyType} in ${property.locationText || 'your selected area'}.`;
  const currentDate = new Date();
  const todayIsoDate = formatIsoDateInput(
    `${String(currentDate.getFullYear()).padStart(4, '0')}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`,
  );
  const isBookable = hasPropertyBookableStayDates(
    property.availableFrom,
    property.availableTo,
    todayIsoDate,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.contentWidth,
              {maxWidth: responsive.maxContentWidth},
            ]}>
            <View style={styles.heroSection}>
              <HeroImage
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                style={styles.heroImage}
                width="100%"
              />
              <View style={styles.heroOverlay} />

              <Pressable
                accessibilityRole="button"
                onPress={onBack}
                style={[styles.backButton, {top: topOverlayOffset}]}>
                <BackButtonGraphic height={42} width={46} />
              </Pressable>

              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>{property.title}</Text>
                <View style={styles.locationRow}>
                  <MapMarkerIcon height={18} width={18} />
                  <Text style={styles.locationText}>
                    {property.locationText || 'Location unavailable'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.favoriteWrap}>
                <HeartIcon height={46} width={46} />
              </View>

              <Text style={styles.propertyName}>{property.title}</Text>
              <Text style={styles.descriptionText}>{description}</Text>

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

              <PropertyMapCard
                latitude={property.latitude}
                locationLabel={property.locationText}
                longitude={property.longitude}
                title={property.title}
              />

              <Text style={styles.sectionTitle}>Amenities</Text>
              {amenities.length > 0 ? (
                amenities.map(item => (
                  <Text key={item} style={styles.sectionText}>
                    {`- ${item}`}
                  </Text>
                ))
              ) : (
                <Text style={styles.sectionText}>No amenities listed yet.</Text>
              )}

              <View style={styles.statsRow}>
                <StatColumn label="BEDROOMS" value={String(property.bedrooms)} />
                <StatColumn label="BATHROOMS" value={String(property.bathrooms)} />
                <StatColumn label="TYPE" value={property.propertyType} />
              </View>

              <View style={styles.listingTag}>
                <Text style={styles.listingTagText}>{property.listingType}</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                disabled={!isBookable}
                onPress={onBookNow}
                style={[
                  styles.bookButton,
                  !isBookable ? styles.bookButtonDisabled : null,
                ]}>
                <Text style={styles.bookButtonText}>
                  {isBookable ? 'BOOK NOW' : 'NOT AVAILABLE'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
};

const StatColumn: React.FC<StatColumnProps> = ({label, value}) => {
  return (
    <View style={styles.statColumn}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
};

const InfoRow: React.FC<StatColumnProps> = ({label, value}) => {
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
    backgroundColor: '#16120F',
  },
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 136,
  },
  contentWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  heroSection: {
    height: 338,
    overflow: 'hidden',
    justifyContent: 'space-between',
    marginTop: -1,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 18, 16, 0.22)',
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 2,
  },
  heroTextWrap: {
    position: 'absolute',
    left: spacing.lg,
    bottom: spacing.lg + 10,
    zIndex: 2,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 30,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  detailsCard: {
    marginTop: -24,
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 6,
    paddingBottom: spacing.xl,
  },
  favoriteWrap: {
    position: 'absolute',
    top: -38,
    right: spacing.lg,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 8,
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
  sectionTitle: {
    color: '#B0B0B0',
    fontFamily: fonts.medium,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  sectionText: {
    color: '#C3C3C3',
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl + 4,
    marginBottom: spacing.lg,
    gap: spacing.md,
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
  listingTag: {
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#FFF4E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  listingTagText: {
    color: colors.accent,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  bookButton: {
    minHeight: 54,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
  bookButtonDisabled: {
    backgroundColor: '#C8C3BD',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
});
