import React from 'react';
import {
  Image,
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
import {AppBottomNav, AppTab} from '../components/AppBottomNav';
import {useResponsive} from '../hooks/useResponsive';
import {colors, fonts, radii, spacing} from '../theme';

type PropertyDetailsScreenProps = {
  activeTab: AppTab;
  onBack: () => void;
  onBookNow: () => void;
  onTabPress: (tab: AppTab) => void;
};

export const PropertyDetailsScreen: React.FC<PropertyDetailsScreenProps> = ({
  activeTab,
  onBack,
  onBookNow,
  onTabPress,
}) => {
  const responsive = useResponsive();
  const topOverlayOffset =
    Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 18;

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
                <Image
                  source={require('../assets/images/Group 11.png')}
                  style={styles.backButtonImage}
                />
              </Pressable>

              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>Luxury House</Text>
                <View style={styles.locationRow}>
                  <MapMarkerIcon height={18} width={18} />
                  <Text style={styles.locationText}>Colombo</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.favoriteWrap}>
                <HeartIcon height={46} width={46} />
              </View>

              <Text style={styles.propertyName}>Colombo Luxury House</Text>
              <Text style={styles.descriptionText}>
                Dreamland beach there are white coral rocks that surround the
                beach, this creates a beautiful view of its own.
              </Text>

              <Text style={styles.includeTitle}>Include</Text>
              <Text style={styles.includeText}>• Lorem</Text>
              <Text style={styles.includeText}>• Lorem Ipsum Lorem</Text>
              <Text style={styles.includeText}>• Lorem Ipsum</Text>

              <View style={styles.statsRow}>
                <StatColumn label="PRICE" suffix="/person" value="$350" />
                <StatColumn label="RATING" suffix="/10" value="8.9" />
                <StatColumn label="DURATION" suffix="hours" value="24" />
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={onBookNow}
                style={styles.bookButton}>
                <Text style={styles.bookButtonText}>BOOK NOW</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
  );
};

type StatColumnProps = {
  label: string;
  suffix: string;
  value: string;
};

const StatColumn: React.FC<StatColumnProps> = ({label, suffix, value}) => {
  return (
    <View style={styles.statColumn}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {value}
        <Text style={styles.statSuffix}>{suffix}</Text>
      </Text>
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
  backButtonImage: {
    width: 46,
    height: 42,
    resizeMode: 'contain',
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
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: -2},
    elevation: 6,
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
    marginBottom: spacing.xl,
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
    marginTop: spacing.xl + 4,
    marginBottom: spacing.xl,
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
  statSuffix: {
    fontFamily: fonts.regular,
    fontSize: 12,
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
  bookButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
});
