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
import {useResponsive} from '../hooks/useResponsive';
import {colors, fonts, radii, spacing} from '../theme';
import MenuIcon from '../assets/images/menu 1.svg';
import ProfilePic from '../assets/images/profile_pic.svg';
import HeroBackground from '../assets/images/Untitled design (3) 1.svg';
import RectangleBg from '../assets/images/Rectangle 7.svg';
import JogjaImage from '../assets/images/jogja2 1.svg';
import LombokImage from '../assets/images/lombok2 1.svg';

type HomeScreenProps = {
  activeTab: AppTab;
  onSearchPress?: () => void;
  onTabPress: (tab: AppTab) => void;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  activeTab,
  onSearchPress,
  onTabPress,
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
                <Text
                  style={styles.profileLabel}>{`Hello ${home.userName}.`}</Text>
                <View style={styles.profileImageWrap}>
                  <ProfilePic height="100%" width="100%" />
                </View>
              </Pressable>
            </View>

            <View style={styles.heroCard}>
              <HeroBackground
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                style={styles.heroImage}
                width="100%"
              />
              <View style={styles.heroOverlay} />
              <RectangleBg
                height={114}
                style={styles.heroTextBackdrop}
                width="82%"
              />

              <View style={styles.heroContent}>
                <Text
                  style={[
                    styles.heroGreeting,
                    {fontSize: responsive.isTablet ? 28 : 24},
                  ]}>
                  {`Hello, ${home.userName}.`}
                </Text>
                <Text
                  style={[
                    styles.heroTitle,
                    {fontSize: responsive.isTablet ? 20 : 16},
                  ]}>
                  Welcome to Home Rent
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={onSearchPress}
                style={styles.searchButton}>
                <Text style={styles.searchButtonText}>Search Properties</Text>
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>LATEST PROPERTIES</Text>

            <View
              style={[
                styles.propertiesRow,
                {marginHorizontal: -(responsive.horizontalPadding + 28)},
              ]}>
              <View style={[styles.sideCard, styles.leftSideCard]}>
                <JogjaImage
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                  style={styles.sideImage}
                  width="100%"
                />
              </View>

              <View style={styles.mainCardWrap}>
                <View style={styles.mainCard}>
                  <HeroBackground
                    height="100%"
                    preserveAspectRatio="xMidYMid slice"
                    style={styles.mainCardImage}
                    width="100%"
                  />
                  <View style={styles.mainCardOverlay} />

                  <View style={styles.mainCardContent}>
                    <Text style={styles.propertyTitle}>
                      {home.featuredProperty.title}
                    </Text>
                    <Text style={styles.propertyDescription}>
                      {home.featuredProperty.description}
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={home.onBookNowPress}
                  style={styles.bookNowButton}>
                  <Text style={styles.bookNowText}>Book now</Text>
                </Pressable>
              </View>

              <View style={[styles.sideCard, styles.rightSideCard]}>
                <LombokImage
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                  style={styles.sideImage}
                  width="100%"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <AppBottomNav activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    </SafeAreaView>
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
    flexGrow: 1,
    paddingBottom: 130,
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
    height: 220,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 17, 15, 0.36)',
  },
  heroTextBackdrop: {
    position: 'absolute',
    top: 38,
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: 6,
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
  },
  searchButton: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: '#FFF2DF',
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  searchButtonText: {
    color: colors.primary,
    fontFamily: fonts.heavy,
    fontSize: 16,
  },
  sectionTitle: {
    textAlign: 'center',
    color: colors.textPrimary,
    fontFamily: fonts.heavy,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  propertiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: 36,
  },
  mainCardWrap: {
    flex: 1,
    alignItems: 'center',
  },
  sideCard: {
    width: 58,
    height: 286,
    overflow: 'hidden',
    opacity: 0.2,
  },
  leftSideCard: {
    borderTopRightRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
  },
  rightSideCard: {
    borderTopLeftRadius: radii.lg,
    borderBottomLeftRadius: radii.lg,
  },
  sideImage: {
    ...StyleSheet.absoluteFillObject,
  },
  mainCard: {
    width: '100%',
    maxWidth: 246,
    height: 324,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: {width: 0, height: 10},
    elevation: 8,
  },
  mainCardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  mainCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 17, 15, 0.28)',
  },
  mainCardContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: 58,
  },
  propertyTitle: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 16,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  propertyDescription: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  bookNowButton: {
    position: 'absolute',
    bottom: -24,
    backgroundColor: '#FFAA22',
    borderRadius: radii.md,
    minWidth: 122,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  bookNowText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
